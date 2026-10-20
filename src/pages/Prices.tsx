import { usePrices } from "../hooks/usePrices"
import type { DailyPrice } from "../types"
import { ErrorState, Loader, PageHero, PriceTable } from "../components/ui"

function latestLabel(prices: DailyPrice[]): string {
  const latest = [...prices].sort((a, b) => {
    const left = Date.parse(a.updatedAt)
    const right = Date.parse(b.updatedAt)
    if (Number.isNaN(left) && Number.isNaN(right)) return 0
    if (Number.isNaN(left)) return 1
    if (Number.isNaN(right)) return -1
    return right - left
  })[0]
  return latest?.updatedLabel ?? ""
}

export default function Prices() {
  const { prices, loading, error, reload } = usePrices()
  const refreshed = latestLabel(prices)

  return (
    <main>
      <PageHero
        label="Daily price board"
        title={
          <>
            Market clarity,
            <br />
            <em>updated every day.</em>
          </>
        }
        copy="Indicative export prices based on current availability, grade and prevailing freight conditions."
      />
      <section className="full-prices section">
        <div className="market-bar">
          <span>
            <b className="live-dot" /> Market open
          </span>
          <span>Last refreshed · {refreshed || "—"}</span>
        </div>
        {loading && <Loader label="Loading prices…" />}
        {!loading && error && prices.length === 0 && (
          <ErrorState message={error} onRetry={reload} />
        )}
        {!loading && error && prices.length > 0 && (
          <p className="data-error">
            Showing the saved price board. Live prices could not be loaded.
          </p>
        )}
        {!loading && prices.length > 0 && <PriceTable prices={prices} />}
        <p className="price-disclaimer">
          Prices are indicative and exclude freight, insurance, duties and
          destination charges. Contact our trade desk for a firm quotation.
        </p>
      </section>
    </main>
  )
}
