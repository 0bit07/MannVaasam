export type DailyPriceRow = {
  id: number
  product_name: string
  price: string
  unit: string
  currency: string
  updated_at: string
}

export type DailyPriceDto = {
  id: number
  productName: string
  price: string
  unit: string
  currency: string
  updatedAt: string
  updatedLabel: string
}

function formatUpdatedLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const zone = "Asia/Kolkata"
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone,
  })
  const day = date.toLocaleDateString("en-CA", { timeZone: zone })
  const today = new Date().toLocaleDateString("en-CA", { timeZone: zone })
  if (day === today) return `Today, ${time}`
  const label = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: zone,
  })
  return `${label}, ${time}`
}

export function toDailyPriceDto(row: DailyPriceRow): DailyPriceDto {
  return {
    id: row.id,
    productName: row.product_name,
    price: row.price,
    unit: row.unit,
    currency: row.currency,
    updatedAt: row.updated_at,
    updatedLabel: formatUpdatedLabel(row.updated_at),
  }
}
