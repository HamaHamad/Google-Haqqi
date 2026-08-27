/**
 * Court cost estimation logic (pure functions — unit tested).
 * Figures are indicative simplifications of Jordanian court fee practice.
 */

export type CourtType = "solh" | "bidaya" | "appeal";

export function courtTypeForAmount(amount: number): CourtType {
  return amount <= 10000 ? "solh" : "bidaya";
}

export function calculateCourtFee(amount: number, courtType: CourtType): number {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const rate = courtType === "appeal" ? 0.015 : 0.03;
  return Math.min(Math.max(safeAmount * rate, 20), 1200);
}

export function calculateExpertFee(courtType: CourtType): number {
  if (courtType === "solh") return 150;
  if (courtType === "bidaya") return 250;
  return 0;
}

export const STAMPS_FEE = 20;

export function calculateInitialCosts(amount: number, courtType: CourtType): number {
  return calculateCourtFee(amount, courtType) + calculateExpertFee(courtType) + STAMPS_FEE;
}

export function calculateLawyerFeeRange(amount: number): { min: number; max: number } {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  return { min: safeAmount * 0.1, max: safeAmount * 0.2 };
}
