export type EnquiryRow = {
  id: number
  type: string
  name: string
  company: string
  email: string
  phone: string
  product: string
  volume: string
  message: string
  status: string
  created_at: string
}

export function toEnquiryDto(row: EnquiryRow) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    product: row.product,
    volume: row.volume,
    message: row.message,
    status: row.status === "completed" ? "completed" : "todo",
    createdAt: row.created_at,
  }
}
