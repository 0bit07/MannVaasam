import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"
import { toDailyPriceDto, type DailyPriceRow } from "../_lib/prices"

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const rows = await query<DailyPriceRow>(
        "select * from daily_prices order by sort_order asc, product_name asc",
      )
      return res.status(200).json(rows.map(toDailyPriceDto))
    } catch (error) {
      console.error("list daily prices error", error)
      return res.status(500).json({ error: "Could not load daily prices." })
    }
  }

  if (req.method === "POST") {
    const admin = requireAdmin(req, res)
    if (!admin) return

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
      const orderRows = await query<{ next: number }>(
        "select coalesce(max(sort_order), 0) + 1 as next from daily_prices",
      )
      const rows = await query<DailyPriceRow>(
        `insert into daily_prices (product_name, price, unit, currency, sort_order)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [productName, price, unit, currency, orderRows[0]?.next ?? 1],
      )
      return res.status(201).json(toDailyPriceDto(rows[0]))
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
      console.error("create daily price error", error)
      return res.status(500).json({ error: "Could not add the price." })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
