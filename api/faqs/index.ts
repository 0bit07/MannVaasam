import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"
import { slugify } from "../_lib/slugify"

type FaqRow = {
  id: string
  question: string
  answer: string
  sort_order: number
}

function toFaqDto(row: FaqRow) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const rows = await query<FaqRow>(
        "select * from faqs order by sort_order asc, created_at asc",
      )
      return res.status(200).json(rows.map(toFaqDto))
    } catch (error) {
      console.error("list faqs error", error)
      return res.status(500).json({ error: "Could not load FAQs." })
    }
  }

  if (req.method === "POST") {
    const admin = requireAdmin(req, res)
    if (!admin) return

    const body = (req.body ?? {}) as Partial<Record<string, unknown>>
    const question = String(body.question ?? "").trim()
    const answer = String(body.answer ?? "").trim()
    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" })
    }

    const base = slugify(question) || `faq-${Date.now()}`
    try {
      const existing = await query<{ id: string }>(
        "select id from faqs where id = $1 or id like $2",
        [base, `${base}-%`],
      )
      const id = existing.length === 0 ? base : `${base}-${existing.length + 1}`
      const orderRows = await query<{ next: number }>(
        "select coalesce(max(sort_order), 0) + 1 as next from faqs",
      )
      const rows = await query<FaqRow>(
        `insert into faqs (id, question, answer, sort_order)
         values ($1, $2, $3, $4)
         returning *`,
        [id, question, answer, orderRows[0]?.next ?? 1],
      )
      return res.status(201).json(toFaqDto(rows[0]))
    } catch (error) {
      console.error("create faq error", error)
      return res.status(500).json({ error: "Could not add the FAQ." })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
