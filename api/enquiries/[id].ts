import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { toEnquiryDto, type EnquiryRow } from "../_lib/enquiries"
import { withHandler } from "../_lib/handler"

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const admin = requireAdmin(req, res)
  if (!admin) return

  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Missing enquiry id" })
  }

  const status = String(
    (req.body as { status?: unknown } | undefined)?.status ?? "",
  )
  if (status !== "todo" && status !== "completed") {
    return res.status(400).json({ error: "Status must be todo or completed" })
  }

  try {
    const rows = await query<EnquiryRow>(
      `update enquiries
       set status = $2
       where id = $1
       returning *`,
      [id, status],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" })
    }
    return res.status(200).json(toEnquiryDto(rows[0]))
  } catch (error) {
    console.error("update enquiry status error", error)
    return res.status(500).json({ error: "Could not update the enquiry." })
  }
}

export default withHandler(handler)
