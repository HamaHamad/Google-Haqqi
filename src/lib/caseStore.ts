/**
 * Client-side case store: a stable per-browser caseId plus all case data
 * persisted in localStorage. Used by drafting, dossier export and sharing.
 */
import { loadJSON, saveJSON } from "./storage";
import type { DossierData } from "./pdf";

export const KEYS = {
  caseId: "haqqi_case_id",
  tasks: "haqqi_tasks",
  workflow: "haqqi_workflow",
  evaluation: "haqqi_evaluation",
  calculator: "haqqi_calculator",
  drafts: "haqqi_drafts",
  intake: "haqqi_intake_messages",
  profile: "haqqi_profile",
  logEvents: "haqqi_log_events",
  voiceNotes: "haqqi_voice_notes",
} as const;

export interface CaseProfile {
  clientName: string;
  nationalId: string;
  accidentDate: string;
  insurerName: string;
  [key: string]: string;
}

export function getCaseId(): string {
  let id = loadJSON<string | null>(KEYS.caseId, null);
  if (!id || typeof id !== "string") {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().slice(0, 8)
        : `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    saveJSON(KEYS.caseId, id);
  }
  return id;
}

export function getProfile(): CaseProfile {
  return loadJSON<CaseProfile>(KEYS.profile, {
    clientName: "",
    nationalId: "",
    accidentDate: "",
    insurerName: "",
  });
}

export function saveProfile(profile: Partial<CaseProfile>): CaseProfile {
  const merged: CaseProfile = { ...getProfile() };
  for (const [key, value] of Object.entries(profile)) {
    if (typeof value === "string" && value) {
      merged[key] = value;
    }
  }
  saveJSON(KEYS.profile, merged);
  return merged;
}

/** Drafting uses real profile data when available; honest placeholders otherwise. */
export function profileForDrafting(): Record<string, string> {
  const p = getProfile();
  return {
    clientName: p.clientName || "[اسم الموكل]",
    nationalId: p.nationalId || "[الرقم الوطني]",
    accidentDate: p.accidentDate || "[تاريخ الحادث]",
    insurerName: p.insurerName || "[اسم شركة التأمين]",
    lawyerName: "[اسم المحامي الموكل]",
  };
}

/** Flatten the AI intake transcript for draft generation context. */
export function getIntakeTranscript(maxChars = 6000): string {
  const msgs = loadJSON<Array<{ role: string; content: string }>>(KEYS.intake, []);
  const text = msgs.map((m) => `${m.role === "user" ? "المستخدم" : "المساعد"}: ${m.content}`).join("\n");
  return text.slice(-maxChars);
}

export function getSavedDrafts(): Array<{
  id: string;
  templateType: string;
  label: string;
  content: string;
  createdAt: string;
}> {
  return loadJSON(KEYS.drafts, []);
}

export function saveDraft(draft: {
  templateType: string;
  label: string;
  content: string;
}): void {
  const drafts = getSavedDrafts();
  drafts.unshift({ id: `${Date.now()}`, createdAt: new Date().toISOString(), ...draft });
  saveJSON(KEYS.drafts, drafts.slice(0, 20));
}

const WORKFLOW_TITLES = [
  "موقع الحادث (الكروكا)",
  "التقرير الطبي الأولي",
  "إبلاغ شركة التأمين",
  "استكمال العلاج واللجنة الطبية",
  "تقديم المطالبة المالية",
  "اللجوء للقضاء أو البنك المركزي",
];

/** Aggregate everything stored locally into a portable dossier payload. */
export function getCasePayload(): DossierData {
  const tasks = loadJSON<Array<{ title: string; completed: boolean }>>(KEYS.tasks, []);
  const completedSteps = loadJSON<number[]>(KEYS.workflow, []);
  const evaluation = loadJSON<{ answers: Record<string, string>; score: number; label: string; description: string } | null>(
    KEYS.evaluation,
    null
  );
  const calculator = loadJSON<{ advice: string; rights: string[] } | null>(KEYS.calculator, null);
  const drafts = getSavedDrafts();
  const profile = getProfile();

  const profileDisplay: Record<string, string> = {
    "اسم الموكل": profile.clientName,
    "الرقم الوطني": profile.nationalId,
    "تاريخ الحادث": profile.accidentDate,
    "شركة التأمين": profile.insurerName,
  };

  return {
    caseId: getCaseId(),
    exportedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    profile: profileDisplay,
    tasks,
    workflow: WORKFLOW_TITLES.map((title, i) => ({
      title,
      completed: completedSteps.includes(i + 1),
    })),
    evaluation: evaluation
      ? {
          score: evaluation.score,
          label: evaluation.label,
          description: evaluation.description,
        }
      : null,
    calculator,
    drafts: drafts.map((d) => ({
      label: d.label,
      createdAt: d.createdAt.slice(0, 16).replace("T", " "),
      content: d.content,
    })),
  };
}
