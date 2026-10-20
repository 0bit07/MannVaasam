import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"

type FaqRow = {
  id: string
  question: string
  answer: string
}

function toFaqDto(row: FaqRow) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const id = String(req.query.id ?? "").trim()
  if (!id) {
    return res.status(400).json({ error: "Missing FAQ id" })
  }

  if (req.method === "PUT") {
    const body = (req.body ?? {}) as Partial<Record<string, unknown>>
    const question = String(body.question ?? "").trim()
    const answer = String(body.answer ?? "").trim()
    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" })
    }

    try {
      const rows = await query<FaqRow>(
        `update faqs
         set question = $2, answer = $3, updated_at = now()
         where id = $1
         returning id, question, answer`,
        [id, question, answer],
      )
      if (rows.length === 0) {
        return res.status(404).json({ error: "FAQ not found" })
      }
      return res.status(200).json(toFaqDto(rows[0]))
    } catch (error) {
      console.error("update faq error", error)
      return res.status(500).json({ error: "Could not update the FAQ." })
    }
  }

  if (req.method === "DELETE") {
    try {
      const rows = await query<{ id: string }>(
        "delete from faqs where id = $1 returning id",
        [id],
      )
      if (rows.length === 0) {
        return res.status(404).json({ error: "FAQ not found" })
      }
      return res.status(204).end()
    } catch (error) {
      console.error("delete faq error", error)
      return res.status(500).json({ error: "Could not delete the FAQ." })
    }
  }

  res.setHeader("Allow", "PUT, DELETE")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
