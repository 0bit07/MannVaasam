import { useApiQuery } from "../lib/apiResource"
import type { Product } from "../types"

export function useProducts() {
  const { data, loading, error, reload } = useApiQuery<Product[]>(
    "/api/products",
    {
      initialData: [],
      timeoutMessage: "The product catalogue took too long to load.",
      fallbackMessage: "Could not load products.",
    },
  )

  return { products: data, loading, error, reload }
}
