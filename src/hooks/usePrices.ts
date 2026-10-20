import { prices as savedPrices } from "../data"
import { useApiQuery } from "../lib/apiResource"
import type { DailyPrice } from "../types"

export function usePrices() {
  const { data, loading, error, reload } = useApiQuery<DailyPrice[]>(
    "/api/prices",
    {
      initialData: [],
      timeoutMessage: "Daily prices took too long to load.",
      fallbackMessage: "Could not load daily prices.",
      fallbackData: () => savedPrices,
    },
  )

  return { prices: data, loading, error, reload }
}
