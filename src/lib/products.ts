import type { Product } from "../types"

export function mediaUrl(src: string): string {
  if (!src || /^https?:\/\//.test(src)) return src
  const base = import.meta.env.BASE_URL
  return `${base}${src.replace(/^\//, "")}`
}

export function productPath(slug: string): string {
  return `/products/${slug}`
}

export function findProduct(
  products: Product[],
  slug: string | undefined,
): Product | undefined {
  return products.find((product) => product.slug === slug)
}
