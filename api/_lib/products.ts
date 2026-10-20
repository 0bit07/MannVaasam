export type ProductRow = {
  slug: string
  name: string
  category: string
  origin: string
  price: string
  unit: string
  grade: string
  image: string
  alt: string
  description: string
  secondary_image: string | null
  secondary_alt: string | null
  specs: unknown
  note_lead: string | null
  note_emphasis: string | null
  note: string | null
}

export type ProductSpecDto = {
  label: string
  value: string
}

export type ProductDto = {
  slug: string
  name: string
  category: string
  origin: string
  price: string
  unit: string
  grade: string
  image: string
  alt: string
  description: string
  secondaryImage?: string
  secondaryAlt?: string
  specs?: ProductSpecDto[]
  noteLead?: string
  noteEmphasis?: string
  note?: string
}

export function toProductDto(row: ProductRow): ProductDto {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    origin: row.origin,
    price: row.price,
    unit: row.unit,
    grade: row.grade,
    image: row.image,
    alt: row.alt,
    description: row.description,
    secondaryImage: row.secondary_image ?? undefined,
    secondaryAlt: row.secondary_alt ?? undefined,
    specs: Array.isArray(row.specs) ? row.specs as ProductSpecDto[] : undefined,
    noteLead: row.note_lead ?? undefined,
    noteEmphasis: row.note_emphasis ?? undefined,
    note: row.note ?? undefined,
  }
}

export const PRODUCT_WRITABLE_FIELDS = [
  "name",
  "category",
  "origin",
  "price",
  "unit",
  "grade",
  "image",
  "alt",
  "description",
] as const

export type ProductWritableField = typeof PRODUCT_WRITABLE_FIELDS[number]
