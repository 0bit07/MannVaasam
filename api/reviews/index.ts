import type { VercelRequest, VercelResponse } from "@vercel/node"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"
import { enforceRateLimit } from "../_lib/rateLimit"

type ReviewRow = {
  id: string
  name: string
  company: string
  rating: number
  comment: string
  created_at: string
}

function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

function toReviewDto(row: ReviewRow) {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    rating: Number(row.rating),
    comment: row.comment,
    date: formatReviewDate(row.created_at),
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const rows = await query<ReviewRow>(
        "select * from reviews order by created_at desc",
      )
      return res.status(200).json(rows.map(toReviewDto))
    } catch (error) {
      console.error("list reviews error", error)
      return res.status(500).json({ error: "Could not load reviews." })
    }
  }

  if (req.method === "POST") {
    // Public endpoint — throttle per IP so the review form can't be used to
    // spam the reviews table.
    const allowed = await enforceRateLimit(req, res, {
      scope: "reviews-create",
      limit: 5,
      windowSeconds: 600,
    })
    if (!allowed) return

    const body = (req.body ?? {}) as Partial<Record<string, unknown>>
    const name = String(body.name ?? "").trim() || "Anonymous buyer"
    const company = String(body.company ?? "").trim() || "Verified partner"
    const comment = String(body.comment ?? "").trim()
    const rating = Number(body.rating)

    if (!comment) {
      return res.status(400).json({ error: "A comment is required" })
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be from 1 to 5" })
    }

    try {
      const rows = await query<ReviewRow>(
        `insert into reviews (id, name, company, rating, comment)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [`review-${Date.now()}`, name, company, rating, comment],
      )
      return res.status(201).json(toReviewDto(rows[0]))
    } catch (error) {
      console.error("create review error", error)
      return res
        .status(500)
        .json({ error: "Could not save the review. Please try again." })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
