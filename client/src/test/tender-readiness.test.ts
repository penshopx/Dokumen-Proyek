import { describe, expect, it } from "vitest";
import {
  calculateTenderReadinessScore,
  getTenderReadinessGaps,
  TENDER_READINESS_QUESTIONS,
} from "../lib/tender-readiness";

describe("tender readiness scoring", () => {
  it("returns 100 when every applicable dimension is ready", () => {
    const answers = Object.fromEntries(
      TENDER_READINESS_QUESTIONS.map((question) => [question.id, "ready"]),
    );

    expect(calculateTenderReadinessScore(answers)).toBe(100);
    expect(getTenderReadinessGaps(answers)).toEqual([]);
  });

  it("normalizes the score when a dimension is not required", () => {
    const answers = Object.fromEntries(
      TENDER_READINESS_QUESTIONS.map((question) => [
        question.id,
        question.id === "sbu" ? "not-required" : "ready",
      ]),
    );

    expect(calculateTenderReadinessScore(answers)).toBe(100);
  });

  it("gives partial answers half credit and prioritizes larger gaps", () => {
    const answers = Object.fromEntries(
      TENDER_READINESS_QUESTIONS.map((question) => [
        question.id,
        question.id === "sbu" ? "missing" : question.id === "skk" ? "partial" : "ready",
      ]),
    );
    const gaps = getTenderReadinessGaps(answers);

    expect(calculateTenderReadinessScore(answers)).toBe(73);
    expect(gaps.map((gap) => gap.id)).toEqual(["sbu", "skk"]);
  });

  it("returns no score when all dimensions are marked not required", () => {
    const answers = Object.fromEntries(
      TENDER_READINESS_QUESTIONS.map((question) => [question.id, "not-required"]),
    );

    expect(calculateTenderReadinessScore(answers)).toBeNull();
  });
});
