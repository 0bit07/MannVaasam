import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAdmin } from "../_lib/auth"
import { query } from "../_lib/db"
import { withHandler } from "../_lib/handler"
import { toProductDto, type ProductRow } from "../_lib/products"
import { slugify } from "../_lib/slugify"

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const rows = await query<ProductRow>(
        "select * from products order by created_at asc",
      )
      return res.status(200).json(rows.map(toProductDto))
    } catch (error) {
      console.error("list products error", error)
      return res.status(500).json({ error: "Could not load products." })
    }
  }

  if (req.method === "POST") {
    const admin = requireAdmin(req, res)
    if (!admin) return

    const body = (req.body ?? {}) as Record<string, string>
    const name = (body.name ?? "").trim()
    const price = (body.price ?? "").trim()
    const image = (body.image ?? "").trim()
    const description = (body.description ?? "").trim()

    if (!name || !price || !image || !description) {
      return res
        .status(400)
        .json({ error: "Name, price, image and description are required" })
    }

    const category = (body.category ?? "").trim() || "Other"
    const origin = (body.origin ?? "").trim() || "India"
    const unit = (body.unit ?? "").trim() || "per unit"
    const grade = (body.grade ?? "").trim() || "Standard"
    const alt = (body.alt ?? "").trim() || name
    const slug = slugify(body.slug || name)

    if (!slug) {
      return res
        .status(400)
        .json({ error: "Could not derive a valid slug from the name" })
    }

    try {
      const existing = await query<{ slug: string }>(
        "select slug from products where slug = $1",
        [slug],
      )
      if (existing.length > 0) {
        return res
          .status(409)
          .json({ error: "A product with this name already exists" })
      }

      const rows = await query<ProductRow>(
        `insert into products (slug, name, category, origin, price, unit, grade, image, alt, description)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         returning *`,
        [
          slug,
          name,
          category,
          origin,
          price,
          unit,
          grade,
          image,
          alt,
          description,
        ],
      )
      return res.status(201).json(toProductDto(rows[0]))
    } catch (error) {
      console.error("create product error", error)
      return res.status(500).json({ error: "Could not create the product" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "Method not allowed" })
}

export default withHandler(handler)
