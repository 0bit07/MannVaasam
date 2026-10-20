import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"
import {
  PRODUCT_WRITABLE_FIELDS,
  toProductDto,
  type ProductRow,
  type ProductWritableField,
} from "../_lib/products"

async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const slug = String(req.query.slug ?? "")
  if (!slug) {
    return res.status(400).json({ error: "Missing product slug" })
  }

  if (req.method === "PUT") {
    const body = (req.body ?? {}) as Record<string, string>
    const updates: Partial<Record<ProductWritableField, string>> = {}

    for (const field of PRODUCT_WRITABLE_FIELDS) {
      const value = body[field]
      if (typeof value === "string" && value.trim()) {
        updates[field] = value.trim()
      }
    }

    const fields = Object.keys(updates) as ProductWritableField[]
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    const setClauses = fields.map((field, index) => `${field} = $${index + 2}`)
    const values = fields.map((field) => updates[field])

    try {
      const rows = await query<ProductRow>(
        `update products set ${setClauses.join(", ")}, updated_at = now()
         where slug = $1
         returning *`,
        [slug, ...values],
      )
      if (rows.length === 0) {
        return res.status(404).json({ error: "Product not found" })
      }
      return res.status(200).json(toProductDto(rows[0]))
    } catch (error) {
      console.error("update product error", error)
      return res.status(500).json({ error: "Could not update the product" })
    }
  }

  if (req.method === "DELETE") {
    try {
      await query("delete from products where slug = $1", [slug])
      return res.status(204).end()
    } catch (error) {
      console.error("delete product error", error)
      return res.status(500).json({ error: "Could not remove the product." })
    }
  }

  res.setHeader("Allow", "PUT, DELETE")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
