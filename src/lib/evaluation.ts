/**
 * Case strength scoring (pure function — unit tested).
 */

export interface EvaluationAnswers {
  kroka: "yes" | "no" | null;
  insurance: "yes" | "no" | null;
  medical: "yes" | "no" | "na" | null;
  photos: "yes" | "no" | null;
  witnesses: "yes" | "no" | null;
}

export interface ScoreDetails {
  label: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
}

export function calculateScore(answers: EvaluationAnswers): number {
  let score = 0;
  let maxScore = 100;

  if (answers.kroka === "yes") score += 40;
  if (answers.insurance === "yes") score += 20;
  if (answers.medical === "yes") {
    score += 20;
  } else if (answers.medical === "na") {
    maxScore -= 20;
  }
  if (answers.photos === "yes") score += 10;
  if (answers.witnesses === "yes") score += 10;

  return Math.round((score / maxScore) * 100);
}

export function getScoreDetails(score: number): ScoreDetails {
  if (score >= 80)
    return {
      label: "قوية جداً",
      color: "text-emerald-600",
      bg: "bg-emerald-500",
      border: "border-emerald-200",
      desc: "فرص نجاح المطالبة والحصول على التعويض عالية جداً. أدلتك مكتملة.",
    };
  if (score >= 50)
    return {
      label: "متوسطة",
      color: "text-amber-500",
      bg: "bg-amber-500",
      border: "border-amber-200",
      desc: "القضية جيدة ولكن قد تواجه بعض التحديات أو تأخيرات في التفاوض بسبب نقص بعض الأدلة.",
    };
  return {
    label: "ضعيفة",
    color: "text-rose-500",
    bg: "bg-rose-500",
    border: "border-rose-200",
    desc: "فرص النجاح منخفضة حالياً. ينقصك أدلة جوهرية (مثل الكروكا أو التعرف على المتسبب) مما يصعب المطالبة.",
  };
}

export function isEvaluationComplete(answers: EvaluationAnswers): boolean {
  return (
    answers.kroka !== null &&
    answers.insurance !== null &&
    answers.medical !== null &&
    answers.photos !== null &&
    answers.witnesses !== null
  );
}
