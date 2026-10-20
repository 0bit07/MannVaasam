import type { VercelRequest, VercelResponse } from "@vercel/node"
import jwt from "jsonwebtoken"

const COOKIE_NAME = "mv_admin_session"
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60

export type AdminTokenPayload = {
  sub: number
  username: string
}

function requireSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET environment variable is not set")
  return secret
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, requireSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS,
  })
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, requireSecret())
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof decoded.sub !== "undefined" &&
      typeof (decoded as { username?: unknown }).username === "string"
    ) {
      return {
        sub: Number(decoded.sub),
        username: (decoded as { username: string }).username,
      }
    }
    return null
  } catch {
    return null
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  const cookies: Record<string, string> = {}
  for (const part of header.split(";")) {
    const index = part.indexOf("=")
    if (index === -1) continue
    const key = decodeURIComponent(part.slice(0, index).trim())
    const value = decodeURIComponent(part.slice(index + 1).trim())
    cookies[key] = value
  }
  return cookies
}

function isLocalRequest(req: VercelRequest): boolean {
  const host = req.headers.host || ""
  return host.includes("localhost") || host.includes("127.0.0.1")
}

export function getAdminFromRequest(
  req: VercelRequest,
): AdminTokenPayload | null {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  return verifyAdminToken(token)
}

export function setSessionCookie(
  req: VercelRequest,
  res: VercelResponse,
  token: string,
) {
  const attributes = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ]
  if (!isLocalRequest(req)) attributes.push("Secure")
  res.setHeader("Set-Cookie", attributes.join("; "))
}

export function clearSessionCookie(req: VercelRequest, res: VercelResponse) {
  const attributes = [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ]
  if (!isLocalRequest(req)) attributes.push("Secure")
  res.setHeader("Set-Cookie", attributes.join("; "))
}

/**
 * Returns the authenticated admin, or writes a 401 response and returns null.
 * Callers must `return` immediately when this returns null.
 */
export function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
): AdminTokenPayload | null {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    res.status(401).json({ error: "Not authenticated" })
    return null
  }
  return admin
}
