import type { VercelRequest, VercelResponse } from "@vercel/node"
import { query } from "./db"

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"]
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded
  const ip = value?.split(",")[0]?.trim()
  return ip || req.socket?.remoteAddress || "unknown"
}

type RateLimitOptions = {
  key: string
  limit: number
  windowSeconds: number
}

/**
 * Best-effort, database-backed rate limiter. A plain in-memory counter
 * wouldn't reliably protect anything here since Vercel Serverless Functions
 * can cold-start on every request; storing the counter in Postgres (which is
 * already required by this app) makes the limit actually hold across
 * invocations.
 *
 * Returns true if the request is allowed, false if the caller is over the
 * limit for this window. Fails open (allows the request) if the rate-limit
 * table or database itself is unreachable, so an infra hiccup never blocks
 * legitimate traffic on its own.
 */
export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<boolean> {
  try {
    const rows = await query<{ count: number }>(
      `insert into rate_limits (key, window_start, count)
       values ($1, now(), 1)
       on conflict (key) do update
         set count = case
               when rate_limits.window_start < now() - make_interval(secs => $2)
                 then 1
               else rate_limits.count + 1
             end,
             window_start = case
               when rate_limits.window_start < now() - make_interval(secs => $2)
                 then now()
               else rate_limits.window_start
             end
       returning count`,
      [key, windowSeconds],
    )
    const count = rows[0]?.count ?? 1
    return count <= limit
  } catch (error) {
    console.error("rate limit check failed", error)
    return true
  }
}

/**
 * Checks the limit for this request and, if exceeded, writes a 429 response
 * directly. Returns whether the request may proceed — callers should
 * `return` immediately when this resolves to false.
 */
export async function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  options: {
    scope: string
    limit: number
    windowSeconds: number
    extra?: string
  },
)/** Extra key component, e.g. a submitted username, to scope the limit further. */
: Promise<boolean> {
  const key = [options.scope, clientIp(req), options.extra]
    .filter(Boolean)
    .join(":")
  const allowed = await checkRateLimit({
    key,
    limit: options.limit,
    windowSeconds: options.windowSeconds,
  })
  if (!allowed) {
    res.setHeader("Retry-After", String(options.windowSeconds))
    res
      .status(429)
      .json({ error: "Too many requests. Please try again shortly." })
  }
  return allowed
}
