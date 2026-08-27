/** Safe, typed localStorage helpers (never throw, SSR/quota safe). */

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

/** Persist a React state value under a key. Returns initial value from storage if present. */
export function persistedState<T>(key: string, initial: T): [T] {
  return [loadJSON(key, initial)];
}
