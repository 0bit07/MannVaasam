import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"
import { toDailyPriceDto, type DailyPriceRow } from "../_lib/prices"

async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Missing price id" })
  }

  if (req.method === "PUT") {
    const body = (req.body ?? {}) as Partial<Record<string, unknown>>
    const productName = String(body.productName ?? "").trim()
    const price = String(body.price ?? "").trim()
    const unit = String(body.unit ?? "").trim()
    const currency = String(body.currency ?? "").trim() || "USD"

    if (!productName || !price || !unit) {
      return res
        .status(400)
        .json({ error: "Product, price and unit are required" })
    }

    try {
      const rows = await query<DailyPriceRow>(
        `update daily_prices
         set product_name = $2,
             price = $3,
             unit = $4,
             currency = $5,
             updated_at = now()
         where id = $1
         returning *`,
        [id, productName, price, unit, currency],
      )
      if (rows.length === 0) {
        return res.status(404).json({ error: "Price not found" })
      }
      return res.status(200).json(toDailyPriceDto(rows[0]))
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : ""
      if (code === "23505") {
        return res
          .status(409)
          .json({ error: "That product is already on the price board" })
      }
      console.error("update daily price error", error)
      return res.status(500).json({ error: "Could not update the price." })
    }
  }

  if (req.method === "DELETE") {
    try {
      const rows = await query<{ id: number }>(
        "delete from daily_prices where id = $1 returning id",
        [id],
      )
      if (rows.length === 0) {
        return res.status(404).json({ error: "Price not found" })
      }
      return res.status(204).end()
    } catch (error) {
      console.error("delete daily price error", error)
      return res.status(500).json({ error: "Could not remove the price." })
    }
  }

  res.setHeader("Allow", "PUT, DELETE")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
