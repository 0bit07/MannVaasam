import { useEffect } from "react"
import { useProducts } from "../hooks/useProducts"
import { findProduct } from "../lib/products"
import type { Go } from "../types"
import { Button, Eyebrow } from "../components/ui"
import NotFound from "./NotFound"

type ProductDetailsProps = {
  slug?: string
  go: Go
}

export default function ProductDetails({ slug, go }: ProductDetailsProps) {
  const { products, loading, error } = useProducts()
  const product = findProduct(products, slug)

  useEffect(() => {
    if (loading) return
    document.title = product
      ? `${product.name} · Mannvaasam Global Exim`
      : "Page not found · Mannvaasam Global Exim"
  }, [loading, product])

  if (loading) {
    return (
      <main>
        <p className="data-state page-loading">Loading product…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <p className="data-state data-error page-loading">{error}</p>
      </main>
    )
  }

  if (!product) return <NotFound go={go} />

  const hasSpecs = Boolean(product.specs && product.specs.length > 0)
  const hasNote = Boolean(
    product.note && product.noteLead && product.noteEmphasis,
  )

  return (
    <main>
      <section className="detail-hero">
        <div
          className={
            product.secondaryImage ? "detail-gallery" : "detail-gallery single"
          }
        >
          <img
            className="detail-main-image"
            src={product.image}
            alt={product.alt}
          />
          {product.secondaryImage && (
            <img
              src={product.secondaryImage}
              alt={product.secondaryAlt || product.alt}
            />
          )}
        </div>
        <div className="detail-info">
          <button className="back-link" onClick={() => go("/products")}>
            ← All products
          </button>
          <Eyebrow>
            {product.category} · {product.origin}
          </Eyebrow>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price">
            <strong>{product.price}</strong>
            <span>{product.unit} · Indicative FOB</span>
          </div>
          <dl>
            {hasSpecs ? (
              product.specs!.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))
            ) : (
              <>
                <div>
                  <dt>Grade</dt>
                  <dd>{product.grade}</dd>
                </div>
                <div>
                  <dt>Origin</dt>
                  <dd>{product.origin}</dd>
                </div>
                <div>
                  <dt>Unit</dt>
                  <dd>{product.unit}</dd>
                </div>
              </>
            )}
          </dl>
          <Button onClick={() => go("/enquiry")}>Request a quote</Button>
        </div>
      </section>
      {hasNote && (
        <section className="product-note section">
          <Eyebrow>Harvest note</Eyebrow>
          <h2>
            {product.noteLead}
            <br />
            <em>{product.noteEmphasis}</em>
          </h2>
          <p>{product.note}</p>
        </section>
      )}
    </main>
  )
}
