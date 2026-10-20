import type { VercelRequest, VercelResponse } from "@vercel/node"
import bcrypt from "bcryptjs"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"

type AdminUserRow = {
  id: number
  username: string
  created_at: string
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = requireAdmin(req, res)
  if (!admin) return

  if (req.method === "GET") {
    try {
      const rows = await query<AdminUserRow>(
        "select id, username, created_at from admin_users order by created_at asc",
      )
      return res.status(200).json(
        rows.map((row) => ({
          username: row.username,
          createdAt: row.created_at,
        })),
      )
    } catch (error) {
      console.error("list admin users error", error)
      return res.status(500).json({ error: "Could not load users." })
    }
  }

  if (req.method === "POST") {
    const { username, password } = (req.body ?? {}) as {
      username?: string
      password?: string
    }

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" })
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" })
    }

    try {
      const existing = await query(
        "select id from admin_users where username = $1",
        [username],
      )
      if (existing.length > 0) {
        return res.status(409).json({ error: "That username is already taken" })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      await query(
        "insert into admin_users (username, password_hash) values ($1, $2)",
        [username, passwordHash],
      )
      return res.status(201).json({ username })
    } catch (error) {
      console.error("create admin user error", error)
      return res.status(500).json({ error: "Could not create the user" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
