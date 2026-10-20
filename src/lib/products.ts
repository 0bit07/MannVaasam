import type { Product } from "../types"

export function productPath(slug: string): string {
  return `/products/${slug}`
}

export function findProduct(
  products: Product[],
  slug: string | undefined,
): Product | undefined {
  return products.find((product) => product.slug === slug)
}
