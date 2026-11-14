import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import { authOtpChallenges, appRateLimitBuckets } from "@shared/schema";
import { db } from "../db";

const OTP_TTL_MS = 10 * 60_000;
const OTP_RESEND_COOLDOWN_MS = 60_000;
const OTP_MAX_ATTEMPTS = 5;

function hmac(purpose: string, value: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required to protect shared authentication state.");
  }
  return createHmac("sha256", secret).update(`${purpose}\0${value}`).digest("hex");
}

export function hashRateLimitScope(scope: string): string {
  return hmac("rate-limit", scope);
}

export function hashOtpIdentifier(channel: string, identifier: string): string {
  return hmac("otp-identifier", `${channel}\0${identifier}`);
}

function hashOtpCode(channel: string, identifier: string, code: string): string {
  return hmac("otp-code", `${channel}\0${identifier}\0${code}`);
}

function matchesHash(actualHex: string, expectedHex: string): boolean {
  const actual = Buffer.from(actualHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Atomically consumes one request from a fixed-window counter shared by all instances. */
export async function consumeRateLimit(
  scope: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  if (!Number.isInteger(maxRequests) || maxRequests < 1 || !Number.isInteger(windowMs) || windowMs < 1) {
    throw new Error("Rate-limit maximum and window must be positive integers.");
  }

  const keyHash = hashRateLimitScope(scope);
  const [bucket] = await db
    .insert(appRateLimitBuckets)
    .values({
      keyHash,
      count: 1,
      resetAt: sql`now() + ${windowMs} * interval '1 millisecond'`,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: appRateLimitBuckets.keyHash,
      set: {
        count: sql`CASE
          WHEN ${appRateLimitBuckets.resetAt} <= now() THEN 1
          ELSE LEAST(${appRateLimitBuckets.count} + 1, ${maxRequests + 1})
        END`,
        resetAt: sql`CASE
          WHEN ${appRateLimitBuckets.resetAt} <= now()
            THEN now() + ${windowMs} * interval '1 millisecond'
          ELSE ${appRateLimitBuckets.resetAt}
        END`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ count: appRateLimitBuckets.count });

  return !!bucket && bucket.count <= maxRequests;
}

/** Stores only HMAC digests; the plain identifier and code are never persisted. */
export async function issueOtpChallenge(
  channel: string,
  identifier: string,
  code: string,
): Promise<boolean> {
  const keyHash = hashOtpIdentifier(channel, identifier);
  const otpHash = hashOtpCode(channel, identifier, code);
  const [challenge] = await db
    .insert(authOtpChallenges)
    .values({
      keyHash,
      channel,
      otpHash,
      attempts: 0,
      expiresAt: sql`now() + ${OTP_TTL_MS} * interval '1 millisecond'`,
      resendAt: sql`now() + ${OTP_RESEND_COOLDOWN_MS} * interval '1 millisecond'`,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: authOtpChallenges.keyHash,
      set: {
        channel,
        otpHash,
        attempts: 0,
        expiresAt: sql`now() + ${OTP_TTL_MS} * interval '1 millisecond'`,
        resendAt: sql`now() + ${OTP_RESEND_COOLDOWN_MS} * interval '1 millisecond'`,
        updatedAt: sql`now()`,
      },
      setWhere: sql`${authOtpChallenges.resendAt} <= now()`,
    })
    .returning({ keyHash: authOtpChallenges.keyHash });

  return !!challenge;
}

export async function revokeOtpChallenge(
  channel: string,
  identifier: string,
  code: string,
): Promise<void> {
  await db
    .delete(authOtpChallenges)
    .where(and(
      eq(authOtpChallenges.keyHash, hashOtpIdentifier(channel, identifier)),
      eq(authOtpChallenges.otpHash, hashOtpCode(channel, identifier, code)),
    ));
}

export type OtpVerificationResult = "verified" | "invalid" | "too_many_attempts";

/** Verifies and consumes a code once, even when requests reach different instances concurrently. */
export async function verifyOtpChallenge(
  channel: string,
  identifier: string,
  code: string,
): Promise<OtpVerificationResult> {
  const keyHash = hashOtpIdentifier(channel, identifier);
  const [challenge] = await db
    .select({
      otpHash: authOtpChallenges.otpHash,
      attempts: authOtpChallenges.attempts,
    })
    .from(authOtpChallenges)
    .where(and(
      eq(authOtpChallenges.keyHash, keyHash),
      sql`${authOtpChallenges.expiresAt} > now()`,
    ))
    .limit(1);

  if (!challenge) return "invalid";
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) return "too_many_attempts";

  const submittedHash = hashOtpCode(channel, identifier, code);
  if (matchesHash(challenge.otpHash, submittedHash)) {
    const [consumed] = await db
      .delete(authOtpChallenges)
      .where(and(
        eq(authOtpChallenges.keyHash, keyHash),
        eq(authOtpChallenges.otpHash, challenge.otpHash),
        lt(authOtpChallenges.attempts, OTP_MAX_ATTEMPTS),
        sql`${authOtpChallenges.expiresAt} > now()`,
      ))
      .returning({ keyHash: authOtpChallenges.keyHash });

    return consumed ? "verified" : "invalid";
  }

  const [updated] = await db
    .update(authOtpChallenges)
    .set({
      attempts: sql`${authOtpChallenges.attempts} + 1`,
      updatedAt: sql`now()`,
    })
    .where(and(
      eq(authOtpChallenges.keyHash, keyHash),
      eq(authOtpChallenges.otpHash, challenge.otpHash),
      lt(authOtpChallenges.attempts, OTP_MAX_ATTEMPTS),
      sql`${authOtpChallenges.expiresAt} > now()`,
    ))
    .returning({ attempts: authOtpChallenges.attempts });

  if (!updated) return "invalid";
  return updated.attempts >= OTP_MAX_ATTEMPTS ? "too_many_attempts" : "invalid";
}

export async function pruneExpiredAuthState(): Promise<void> {
  await Promise.all([
    db.delete(authOtpChallenges)
      .where(sql`${authOtpChallenges.expiresAt} < now() - interval '1 hour'`),
    db.delete(appRateLimitBuckets)
      .where(sql`${appRateLimitBuckets.resetAt} < now() - interval '1 hour'`),
  ]);
}
