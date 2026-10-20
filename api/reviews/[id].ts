import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const admin = requireAdmin(req, res)
  if (!admin) return

  const id = String(req.query.id ?? "").trim()
  if (!id) {
    return res.status(400).json({ error: "Missing review id" })
  }

  try {
    const rows = await query<{ id: string }>(
      "delete from reviews where id = $1 returning id",
      [id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: "Review not found" })
    }
    return res.status(204).end()
  } catch (error) {
    console.error("delete review error", error)
    return res.status(500).json({ error: "Could not delete the review." })
  }
}

export default withHandler(handler)
