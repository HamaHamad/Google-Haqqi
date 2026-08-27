import { describe, it, expect } from "vitest";
import { calculateScore, getScoreDetails, isEvaluationComplete } from "../src/lib/evaluation";

const base = {
  kroka: null,
  insurance: null,
  medical: null,
  photos: null,
  witnesses: null,
} as const;

describe("calculateScore", () => {
  it("returns 100 for a complete strong case", () => {
    expect(
      calculateScore({
        kroka: "yes",
        insurance: "yes",
        medical: "yes",
        photos: "yes",
        witnesses: "yes",
      })
    ).toBe(100);
  });

  it("adjusts the maximum when medical is not applicable (property damage only)", () => {
    // kroka 40 + insurance 20 + photos 10 + witnesses 10 = 80 out of 80
    expect(
      calculateScore({
        kroka: "yes",
        insurance: "yes",
        medical: "na",
        photos: "yes",
        witnesses: "yes",
      })
    ).toBe(100);
  });

  it("returns 0 when no evidence exists", () => {
    expect(
      calculateScore({ kroka: "no", insurance: "no", medical: "no", photos: "no", witnesses: "no" })
    ).toBe(0);
  });

  it("weighs kroka as the largest single factor (40 points)", () => {
    const withKroka = calculateScore({ ...base, kroka: "yes", insurance: "no", medical: "no", photos: "no", witnesses: "no" } as never);
    expect(withKroka).toBe(40);
  });
});

describe("getScoreDetails", () => {
  it("labels scores >= 80 as very strong", () => {
    expect(getScoreDetails(80).label).toBe("قوية جداً");
    expect(getScoreDetails(100).color).toBe("text-emerald-600");
  });

  it("labels scores 50-79 as medium", () => {
    expect(getScoreDetails(50).label).toBe("متوسطة");
    expect(getScoreDetails(79).label).toBe("متوسطة");
  });

  it("labels scores < 50 as weak", () => {
    expect(getScoreDetails(49).label).toBe("ضعيفة");
  });
});

describe("isEvaluationComplete", () => {
  it("requires every question to be answered", () => {
    expect(isEvaluationComplete(base as never)).toBe(false);
    expect(
      isEvaluationComplete({
        kroka: "yes",
        insurance: "no",
        medical: "na",
        photos: "no",
        witnesses: "no",
      })
    ).toBe(true);
  });
});
