import type { VercelRequest, VercelResponse } from "@vercel/node"
import bcrypt from "bcryptjs"
import { query } from "../_lib/db"
import { setSessionCookie, signAdminToken } from "../_lib/auth"
import { withHandler } from "../_lib/handler"
import { enforceRateLimit } from "../_lib/rateLimit"

type AdminUserRow = {
  id: number
  username: string
  password_hash: string
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Throttle login attempts per IP so this endpoint can't be brute-forced.
  const allowed = await enforceRateLimit(req, res, {
    scope: "login",
    limit: 10,
    windowSeconds: 60,
  })
  if (!allowed) return

  const { username, password } = (req.body ?? {}) as {
    username?: string
    password?: string
  }

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" })
  }

  try {
    const rows = await query<AdminUserRow>(
      "select id, username, password_hash from admin_users where username = $1",
      [username],
    )
    const user = rows[0]
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password" })
    }

    const token = signAdminToken({ sub: user.id, username: user.username })
    setSessionCookie(req, res, token)
    return res.status(200).json({ username: user.username })
  } catch (error) {
    console.error("login error", error)
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." })
  }
}

export default withHandler(handler)
