import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Point the data dir at a temp folder before importing the module
const tmpDir = fs.mkdtemp(path.join(os.tmpdir(), "haqqi-test-"));
process.env.DATA_DIR = path.join(await tmpDir, "data");

const { readCollection, appendToCollection, removeFromCollection } = await import("../server/db");

describe("JSON file database", () => {
  it("creates and seeds collections on first read", async () => {
    const stories = await readCollection<{ isApproved: boolean }>("stories");
    expect(Array.isArray(stories)).toBe(true);
    expect(stories.length).toBeGreaterThanOrEqual(2); // seeded examples
    expect(stories.every((s) => s.isApproved)).toBe(true);
  });

  it("appends items with generated ids and persists them", async () => {
    const saved = await appendToCollection("contacts", {
      name: "أحمد",
      contact: "test@example.com",
      message: "استفسار تجريبي",
    });
    expect(saved.id).toBeTruthy();
    const all = await readCollection<typeof saved>("contacts");
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("أحمد");
  });

  it("respects a caller-provided id", async () => {
    const saved = await appendToCollection("shares", { id: "tok-1", token: "abc" });
    expect(saved.id).toBe("tok-1");
  });

  it("removes items by id", async () => {
    const a = await appendToCollection("reviews", { content: "draft-1" });
    const b = await appendToCollection("reviews", { content: "draft-2" });
    const removedFirst = await removeFromCollection("reviews", a.id);
    expect(removedFirst).toBe(true);
    const remaining = await readCollection<{ id: string }>("reviews");
    expect(remaining.map((r) => r.id)).toEqual([b.id]);
  });

  it("returns false when removing a non-existent id", async () => {
    expect(await removeFromCollection("reviews", "nope")).toBe(false);
  });

  afterAll(async () => {
    await fs.rm(await tmpDir, { recursive: true, force: true });
  });
});
