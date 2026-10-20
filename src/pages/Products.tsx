import { useState } from "react"
import { useProducts } from "../hooks/useProducts"
import type { Go } from "../types"
import {
  Cta,
  ErrorState,
  Loader,
  PageHero,
  ProductTile,
} from "../components/ui"

export default function Products({ go }: { go: Go }) {
  const { products, loading, error, reload } = useProducts()
  const [filter, setFilter] = useState("All")
  const categories = ["All", "Spices", "Fresh Produce", "Grains"]
  const filtered =
    filter === "All" ? products : products.filter((p) => p.category === filter)
  return (
    <main>
      <PageHero
        label="Our catalogue"
        title={
          <>
            Produce with provenance.
            <br />
            <em>Quality without ambiguity.</em>
          </>
        }
        copy="Export-ready agricultural commodities with clear specifications, consistent grading and dependable fulfilment."
      />
      <section className="catalogue section">
        <div className="filters" role="group" aria-label="Product filters">
          {categories.map((category) => (
            <button
              className={filter === category ? "active" : ""}
              onClick={() => setFilter(category)}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
        {loading && <Loader label="Loading products…" />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="catalogue-grid">
            {filtered.map((product, i) => (
              <ProductTile
                product={product}
                index={i}
                go={go}
                key={product.slug}
              />
            ))}
          </div>
        )}
      </section>
      <Cta go={go} />
    </main>
  )
}
