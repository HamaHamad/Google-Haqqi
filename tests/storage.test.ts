import { describe, it, expect, beforeEach, vi } from "vitest";

// Minimal localStorage mock
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
};

vi.stubGlobal("localStorage", localStorageMock);

import { loadJSON, saveJSON, removeKey } from "../src/lib/storage";

describe("storage helpers", () => {
  beforeEach(() => {
    store.clear();
  });

  it("returns the fallback when nothing is stored", () => {
    expect(loadJSON("missing", { a: 1 })).toEqual({ a: 1 });
  });

  it("round-trips JSON values", () => {
    saveJSON("tasks", [{ title: "ختم الكروكا", completed: false }]);
    expect(loadJSON("tasks", [])).toEqual([{ title: "ختم الكروكا", completed: false }]);
  });

  it("returns the fallback on corrupted JSON instead of throwing", () => {
    store.set("bad", "{not json");
    expect(loadJSON("bad", "fallback")).toBe("fallback");
  });

  it("removes keys safely", () => {
    saveJSON("k", 1);
    removeKey("k");
    expect(loadJSON("k", null)).toBeNull();
  });
});
