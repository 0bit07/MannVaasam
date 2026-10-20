import type { VercelRequest, VercelResponse } from "@vercel/node"

export type ApiHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => unknown | Promise<unknown>

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
}

/**
 * Wraps every API route so that:
 *  - a baseline set of security headers is always sent
 *  - any error that escapes the handler (a bug, a DB failure that wasn't
 *    locally caught, etc.) is logged server-side and turned into a generic
 *    JSON error instead of leaking stack traces, SQL, or connection details
 *    to the client.
 */
export function withHandler(handler: ApiHandler): ApiHandler {
  return async function wrapped(req, res) {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(name, value)
    }
    try {
      return await handler(req, res)
    } catch (error) {
      console.error(`Unhandled error on ${req.method} ${req.url}`, error)
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: "Something went wrong. Please try again." })
      }
    }
  }
}
