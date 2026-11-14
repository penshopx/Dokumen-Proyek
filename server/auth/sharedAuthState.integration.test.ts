import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

const enabled = process.env.AUTH_STATE_DB_TESTS === "1" && process.env.NODE_ENV !== "production";
const databaseDescribe = enabled ? describe : describe.skip;

databaseDescribe("shared auth state database integration", () => {
  let db: any;
  let authOtpChallenges: typeof import("@shared/schema").authOtpChallenges;
  let appRateLimitBuckets: typeof import("@shared/schema").appRateLimitBuckets;
  let consumeRateLimit: typeof import("./sharedAuthState").consumeRateLimit;
  let issueOtpChallenge: typeof import("./sharedAuthState").issueOtpChallenge;
  let verifyOtpChallenge: typeof import("./sharedAuthState").verifyOtpChallenge;
  let hashOtpIdentifier: typeof import("./sharedAuthState").hashOtpIdentifier;
  let hashRateLimitScope: typeof import("./sharedAuthState").hashRateLimitScope;

  const rateScope = `integration:${randomUUID()}`;
  const attemptIdentifier = `integration-attempt-${randomUUID()}@example.test`;
  const singleUseIdentifier = `integration-single-use-${randomUUID()}@example.test`;

  beforeAll(async () => {
    const [databaseModule, schemaModule, authStateModule] = await Promise.all([
      import("../db"),
      import("@shared/schema"),
      import("./sharedAuthState"),
    ]);
    db = databaseModule.db;
    authOtpChallenges = schemaModule.authOtpChallenges;
    appRateLimitBuckets = schemaModule.appRateLimitBuckets;
    consumeRateLimit = authStateModule.consumeRateLimit;
    issueOtpChallenge = authStateModule.issueOtpChallenge;
    verifyOtpChallenge = authStateModule.verifyOtpChallenge;
    hashOtpIdentifier = authStateModule.hashOtpIdentifier;
    hashRateLimitScope = authStateModule.hashRateLimitScope;
  });

  afterAll(async () => {
    if (!db) return;
    await Promise.all([
      db.delete(appRateLimitBuckets).where(eq(
        appRateLimitBuckets.keyHash,
        hashRateLimitScope(rateScope),
      )),
      db.delete(authOtpChallenges).where(eq(
        authOtpChallenges.keyHash,
        hashOtpIdentifier("test", attemptIdentifier),
      )),
      db.delete(authOtpChallenges).where(eq(
        authOtpChallenges.keyHash,
        hashOtpIdentifier("test", singleUseIdentifier),
      )),
    ]);
  });

  it("enforces concurrent request limits using one shared counter", async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () => consumeRateLimit(rateScope, 3, 60_000)),
    );

    expect(results.filter(Boolean)).toHaveLength(3);
    expect(results.filter((allowed) => !allowed)).toHaveLength(5);
  });

  it("persists OTP attempts and applies the resend cooldown", async () => {
    const code = "246810";
    expect(await issueOtpChallenge("test", attemptIdentifier, code)).toBe(true);
    expect(await issueOtpChallenge("test", attemptIdentifier, "135790")).toBe(false);

    const [stored] = await db
      .select()
      .from(authOtpChallenges)
      .where(eq(authOtpChallenges.keyHash, hashOtpIdentifier("test", attemptIdentifier)));
    expect(stored.keyHash).not.toContain(attemptIdentifier);
    expect(stored.otpHash).not.toBe(code);

    for (let attempt = 0; attempt < 4; attempt += 1) {
      expect(await verifyOtpChallenge("test", attemptIdentifier, "000000")).toBe("invalid");
    }
    expect(await verifyOtpChallenge("test", attemptIdentifier, "000000")).toBe("too_many_attempts");
    expect(await verifyOtpChallenge("test", attemptIdentifier, code)).toBe("too_many_attempts");
  });

  it("consumes a correct OTP once under concurrent verification", async () => {
    const code = "753951";
    expect(await issueOtpChallenge("test", singleUseIdentifier, code)).toBe(true);

    const results = await Promise.all([
      verifyOtpChallenge("test", singleUseIdentifier, code),
      verifyOtpChallenge("test", singleUseIdentifier, code),
    ]);
    expect(results.filter((result) => result === "verified")).toHaveLength(1);
    expect(results.filter((result) => result === "invalid")).toHaveLength(1);
  });
});
