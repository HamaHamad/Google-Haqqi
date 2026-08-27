/**
 * Simple JSON-file persistence layer.
 * Each collection is stored as a JSON array inside DATA_DIR.
 * Writes are serialized per collection (queue) and performed atomically (tmp file + rename).
 */
import fs from "fs/promises";
import path from "path";

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const COLLECTIONS = ["stories", "contacts", "shares", "reviews", "evidence"] as const;
export type Collection = (typeof COLLECTIONS)[number];

// Serialize writes per collection to avoid read-modify-write races.
const writeQueues: Record<string, Promise<unknown>> = {};

async function ensureInit(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  for (const name of COLLECTIONS) {
    const file = collectionFile(name);
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, JSON.stringify(seedFor(name), null, 2), "utf8");
    }
  }
}

function collectionFile(name: Collection): string {
  return path.join(DATA_DIR, `${name}.json`);
}

function seedFor(name: Collection): unknown[] {
  if (name === "stories") {
    return [
      {
        id: "seed-1",
        date: "2026-07-15",
        type: "story",
        content:
          "بعد الحادث، حاولت إحدى الشركات المماطلة في دفع مصاريف العلاج. بفضل تقديم شكوى للبنك المركزي، تم صرف المبلغ كاملاً خلال أسبوعين.",
        tags: ["نجاح مطالبات", "البنك المركزي"],
        isApproved: true,
      },
      {
        id: "seed-2",
        date: "2026-08-01",
        type: "warning",
        content:
          "احذروا من الأشخاص الذين يتواجدون حول المستشفيات ويعرضون (شراء الكروكا) أو تمثيلكم مقابل تنازل فوري. لقد وقعت في هذا الفخ وخسرت أكثر من نصف حقي.",
        tags: ["سماسرة الحوادث", "تحذير"],
        isApproved: true,
      },
    ];
  }
  return [];
}

let initPromise: Promise<void> | null = null;
function init(): Promise<void> {
  if (!initPromise) initPromise = ensureInit();
  return initPromise;
}

export async function readCollection<T = Record<string, unknown>>(name: Collection): Promise<T[]> {
  await init();
  try {
    const raw = await fs.readFile(collectionFile(name), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export async function appendToCollection<T extends object>(
  name: Collection,
  item: T
): Promise<T & { id: string }> {
  await init();
  const withId = { id: item instanceof Object && "id" in item && item.id ? item.id : newId(), ...item } as T & { id: string };
  writeQueues[name] = (writeQueues[name] ?? Promise.resolve()).then(async () => {
    const current = await readCollection<T>(name);
    current.push(withId);
    await atomicWrite(collectionFile(name), JSON.stringify(current, null, 2));
  });
  await writeQueues[name];
  return withId;
}

export async function updateInCollection<T extends { id: string }>(
  name: Collection,
  id: string,
  updater: (item: T) => T
): Promise<T | null> {
  await init();
  let updated: T | null = null;
  writeQueues[name] = (writeQueues[name] ?? Promise.resolve()).then(async () => {
    const current = await readCollection<T>(name);
    const idx = current.findIndex((x) => (x as { id?: string }).id === id);
    if (idx === -1) return;
    current[idx] = updater(current[idx]);
    updated = current[idx];
    await atomicWrite(collectionFile(name), JSON.stringify(current, null, 2));
  });
  await writeQueues[name];
  return updated;
}

export async function removeFromCollection(
  name: Collection,
  id: string
): Promise<boolean> {
  await init();
  let removed = false;
  writeQueues[name] = (writeQueues[name] ?? Promise.resolve()).then(async () => {
    const current = await readCollection<{ id: string }>(name);
    const next = current.filter((x) => x.id !== id);
    if (next.length !== current.length) {
      removed = true;
      await atomicWrite(collectionFile(name), JSON.stringify(next, null, 2));
    }
  });
  await writeQueues[name];
  return removed;
}

async function atomicWrite(file: string, content: string): Promise<void> {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, file);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
