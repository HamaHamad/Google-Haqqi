import { describe, it, expect } from "vitest";
import {
  calculateCourtFee,
  calculateExpertFee,
  calculateInitialCosts,
  calculateLawyerFeeRange,
  courtTypeForAmount,
  STAMPS_FEE,
} from "../src/lib/costs";

describe("courtTypeForAmount", () => {
  it("returns solh for amounts up to 10000 JOD", () => {
    expect(courtTypeForAmount(0)).toBe("solh");
    expect(courtTypeForAmount(500)).toBe("solh");
    expect(courtTypeForAmount(10000)).toBe("solh");
  });

  it("returns bidaya above 10000 JOD", () => {
    expect(courtTypeForAmount(10001)).toBe("bidaya");
    expect(courtTypeForAmount(50000)).toBe("bidaya");
  });
});

describe("calculateCourtFee", () => {
  it("applies the 3% rate for first instance courts with a 20 JOD floor", () => {
    expect(calculateCourtFee(5000, "solh")).toBe(150);
    expect(calculateCourtFee(100, "bidaya")).toBe(20); // below floor
  });

  it("applies the reduced appeal rate", () => {
    expect(calculateCourtFee(10000, "appeal")).toBe(150); // 1.5%
  });

  it("caps the fee at 1200 JOD", () => {
    expect(calculateCourtFee(100000, "bidaya")).toBe(1200);
  });

  it("handles NaN and negative amounts safely", () => {
    expect(calculateCourtFee(NaN, "solh")).toBe(20);
    expect(calculateCourtFee(-500, "solh")).toBe(20);
  });
});

describe("calculateExpertFee", () => {
  it("charges 150 for solh, 250 for bidaya and 0 for appeal", () => {
    expect(calculateExpertFee("solh")).toBe(150);
    expect(calculateExpertFee("bidaya")).toBe(250);
    expect(calculateExpertFee("appeal")).toBe(0);
  });
});

describe("calculateInitialCosts", () => {
  it("sums court fee + expert fee + stamps", () => {
    // 5000 * 0.03 = 150, expert 150, stamps 20
    expect(calculateInitialCosts(5000, "solh")).toBe(150 + 150 + STAMPS_FEE);
  });
});

describe("calculateLawyerFeeRange", () => {
  it("returns the 10%-20% contingency range", () => {
    const { min, max } = calculateLawyerFeeRange(5000);
    expect(min).toBe(500);
    expect(max).toBe(1000);
  });

  it("handles invalid amounts without producing NaN", () => {
    const { min, max } = calculateLawyerFeeRange(NaN);
    expect(Number.isNaN(min)).toBe(false);
    expect(Number.isNaN(max)).toBe(false);
  });
});
