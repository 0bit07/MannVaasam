import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getAdminFromRequest } from "../_lib/auth"
import { withHandler } from "../_lib/handler"

function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: "Not authenticated" })
  }
  return res.status(200).json({ username: admin.username })
}

export default withHandler(handler)
