/**
 * Gemini AI helper with lazy client init and fail-fast behavior.
 */
import { GoogleGenAI } from "@google/genai";

export class AiUnavailableError extends Error {
  constructor() {
    super("AI_UNAVAILABLE");
    this.name = "AiUnavailableError";
  }
}

let client: GoogleGenAI | null = null;

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function getClient(): GoogleGenAI {
  if (!isAiConfigured()) throw new AiUnavailableError();
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  return client;
}

export function modelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export interface GenerateOptions {
  systemInstruction?: string;
  temperature?: number;
}

/** Keep prompts bounded: only the most recent turns are sent. */
const MAX_HISTORY_TURNS = 20;

export function formatHistory(history: Array<{ role: string; content: string }>) {
  return history.slice(-MAX_HISTORY_TURNS).map((msg) => ({
    role: msg.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: String(msg.content ?? "").slice(0, 4000) }],
  }));
}

export async function generateText(
  contents: unknown,
  options: GenerateOptions = {}
): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: modelName(),
    contents: contents as never,
    config: {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature ?? 0.3,
    },
  });
  const text = response.text;
  if (!text || !text.trim()) {
    throw new Error("EMPTY_AI_RESPONSE");
  }
  return text;
}
