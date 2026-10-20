import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { toEnquiryDto, type EnquiryRow } from "../_lib/enquiries"
import { withHandler } from "../_lib/handler"
import { enforceRateLimit } from "../_lib/rateLimit"

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const admin = requireAdmin(req, res)
    if (!admin) return

    const rows = await query<EnquiryRow>(
      "select * from enquiries order by created_at desc",
    )
    return res.status(200).json(rows.map(toEnquiryDto))
  }

  if (req.method === "POST") {
    // Public endpoint — throttle per IP so the contact/enquiry form can't be
    // used to spam the enquiries table.
    const allowed = await enforceRateLimit(req, res, {
      scope: "enquiries-create",
      limit: 5,
      windowSeconds: 600,
    })
    if (!allowed) return

    const body = (req.body ?? {}) as Partial<Record<string, string>>
    const name = (body.name ?? "").trim()
    const email = (body.email ?? "").trim()
    const message = (body.message ?? "").trim()

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email and message are required" })
    }

    const type = ["buy", "sell", "contact"].includes(body.type ?? "")
      ? body.type as string
      : "buy"
    const company = (body.company ?? "").trim()
    const phone = (body.phone ?? "").trim()
    const product = (body.product ?? "").trim()
    const volume = (body.volume ?? "").trim()

    try {
      const rows = await query<EnquiryRow>(
        `insert into enquiries (type, name, company, email, phone, product, volume, message)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning *`,
        [type, name, company, email, phone, product, volume, message],
      )
      return res.status(201).json(toEnquiryDto(rows[0]))
    } catch (error) {
      console.error("create enquiry error", error)
      return res
        .status(500)
        .json({ error: "Could not submit the enquiry. Please try again." })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
