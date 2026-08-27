/** Small fetch wrapper for the Haqqi API (same-origin). */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const GENERIC_ERROR = "عذراً، حدث خطأ أثناء الاتصال بالخدمة. يرجى المحاولة مرة أخرى.";

export async function api<T = unknown>(
  path: string,
  options: { method?: string; json?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: options.method ?? (options.json !== undefined ? "POST" : "GET"),
      headers: options.json !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.json !== undefined ? JSON.stringify(options.json) : undefined,
      signal: options.signal,
    });
  } catch {
    throw new ApiError(GENERIC_ERROR, 0);
  }
  if (!res.ok) {
    let message = GENERIC_ERROR;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

/** Upload a File via multipart/form-data. */
export async function uploadFile<T = unknown>(
  file: File,
  fields: { category?: string; caseId?: string } = {}
): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  if (fields.category) form.append("category", fields.category);
  if (fields.caseId) form.append("caseId", fields.caseId);
  let res: Response;
  try {
    res = await fetch("/api/evidence/upload", { method: "POST", body: form });
  } catch {
    throw new ApiError(GENERIC_ERROR, 0);
  }
  if (!res.ok) {
    let message = GENERIC_ERROR;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

/** POST + download response as a file attachment. */
export async function downloadFromApi(
  path: string,
  json: unknown,
  fallbackName: string
): Promise<void> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  if (!res.ok) throw new ApiError(GENERIC_ERROR, res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
