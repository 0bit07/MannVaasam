import type { VercelRequest, VercelResponse } from "@vercel/node"
import { clearSessionCookie } from "../_lib/auth"
import { withHandler } from "../_lib/handler"

function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }
  clearSessionCookie(req, res)
  return res.status(200).json({ ok: true })
}

export default withHandler(handler)
