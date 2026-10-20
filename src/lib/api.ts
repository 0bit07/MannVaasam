export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function abortAfter(ms: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return {
    signal: controller.signal,
    cancel() {
      clearTimeout(timer)
    },
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const contentType = res.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const body = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message =
      body && typeof body === "object" && typeof body.error === "string"
        ? body.error
        : `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  // A 204 No Content response (e.g. DELETE) legitimately has no JSON body.
  if (res.status === 204) {
    return undefined as T
  }

  // Any other "successful" response without a JSON body means the request
  // never reached the API (e.g. a dev server serving the SPA shell for an
  // unknown path instead of returning a 404) rather than a real API error.
  if (!isJson) {
    throw new ApiError(
      "Could not reach the API. Is the backend running?",
      res.status,
    )
  }

  return body as T
}
