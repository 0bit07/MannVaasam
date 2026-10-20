import { useEffect, useState } from "react"
import { heroPlaces, images } from "../data"
import { usePrices } from "../hooks/usePrices"
import { useProducts } from "../hooks/useProducts"
import type { Go } from "../types"
import {
  Arrow,
  Button,
  Cta,
  ErrorState,
  Eyebrow,
  Loader,
  Mark,
  PriceTable,
  ProductTile,
  SectionTitle,
} from "../components/ui"

function HeroVisual() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const place = heroPlaces[index]

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (reduceMotion || paused) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroPlaces.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <div
      className="hero-visual"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slides">
        {heroPlaces.map((slide, slideIndex) => (
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.alt}
            className={slideIndex === index ? "is-active" : ""}
          />
        ))}
      </div>
      <div className="hero-stamp">
        <span>
          RESPONSIBLY
          <br />
          SOURCED
        </span>
        <Mark />
      </div>
      <div className="hero-dots" role="tablist" aria-label="Origin places">
        {heroPlaces.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            className={slideIndex === index ? "is-active" : ""}
            aria-label={slide.name}
            aria-selected={slideIndex === index}
            onClick={() => setIndex(slideIndex)}
          />
        ))}
      </div>
      <div className="hero-caption">
        <span>{place.coords}</span>
        <span>{place.name}</span>
      </div>
    </div>
  )
}

export default function Home({ go }: { go: Go }) {
  const { products, loading, error, reload } = useProducts()
  const {
    prices,
    loading: pricesLoading,
    error: pricesError,
    reload: reloadPrices,
  } = usePrices()

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <Eyebrow>Indian origin · Global standards</Eyebrow>
          <h1>
            Rooted here.
            <br />
            <em>Ready for the world.</em>
          </h1>
          <p>
            Premium agricultural commodities, sourced with integrity and
            delivered with absolute clarity.
          </p>
          <div className="hero-actions">
            <Button onClick={() => go("/products")}>Explore our exports</Button>
            <button className="play-link" onClick={() => go("/about")}>
              <span>▶</span> Our sourcing story
            </button>
          </div>
        </div>
        <HeroVisual />
        <div className="scroll-note">
          Scroll to discover <span>↓</span>
        </div>
      </section>

      <section className="intro section">
        <div className="intro-number">01</div>
        <div className="intro-copy reveal">
          <Eyebrow>Who we are</Eyebrow>
          <h2>
            Trade that carries the
            <br />
            <em>character of its origin.</em>
          </h2>
        </div>
        <div className="intro-detail reveal">
          <p>
            Mannvaasam means “the fragrance of the soil.” It is our promise to
            preserve provenance, quality and trust through every step of the
            export journey.
          </p>
          <button className="text-link" onClick={() => go("/about")}>
            Discover our story <Arrow />
          </button>
        </div>
      </section>

      <section className="products-section section">
        <SectionTitle
          label="Selected exports"
          title={
            <>
              Exceptional produce.
              <br />
              <em>Precisely sourced.</em>
            </>
          }
        />
        <div className="home-products">
          {loading && <Loader label="Loading products…" />}
          {!loading && error && <ErrorState message={error} onRetry={reload} />}
          {!loading &&
            !error &&
            products
              .slice(0, 3)
              .map((product, i) => (
                <ProductTile
                  product={product}
                  index={i}
                  go={go}
                  key={product.slug}
                />
              ))}
        </div>
        <div className="center-action">
          <Button tone="outline" onClick={() => go("/products")}>
            View all products
          </Button>
        </div>
      </section>

      <section className="prices-section section">
        <div className="prices-header">
          <SectionTitle
            label="Market pulse"
            title={
              <>
                Today’s indicative
                <br />
                <em>export prices.</em>
              </>
            }
          />
          <div className="prices-aside">
            <span>
              <b className="live-dot" /> Live market reference
            </span>
            <p>
              Indicative FOB pricing. Final quotes depend on grade, volume,
              packing and destination.
            </p>
          </div>
        </div>
        {pricesLoading && <Loader label="Loading prices…" />}
        {!pricesLoading && pricesError && prices.length === 0 && (
          <ErrorState message={pricesError} onRetry={reloadPrices} />
        )}
        {!pricesLoading && pricesError && prices.length > 0 && (
          <p className="data-error">
            Showing the saved price board. Live prices could not be loaded.
          </p>
        )}
        {!pricesLoading && prices.length > 0 && (
          <PriceTable prices={prices} compact />
        )}
        <button className="text-link table-link" onClick={() => go("/prices")}>
          View complete price board <Arrow />
        </button>
      </section>

      <section className="capabilities section">
        <div className="cap-image reveal">
          <img
            src={images.port}
            alt="Export containers arranged at an international shipping port"
          />
        </div>
        <div className="cap-content">
          <Eyebrow light>Export, handled end to end</Eyebrow>
          <h2>
            From field to freight,
            <br />
            <em>nothing is left to chance.</em>
          </h2>
          <div className="cap-list">
            {[
              [
                "01",
                "Farm-direct sourcing",
                "Verified growers and harvest-level traceability.",
              ],
              [
                "02",
                "Quality assurance",
                "Pre-shipment inspection and destination-ready documentation.",
              ],
              [
                "03",
                "Flexible logistics",
                "Sea and air freight coordination across 18+ trade lanes.",
              ],
            ].map(([n, title, copy]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial section">
        <div className="quote-mark">“</div>
        <blockquote>
          “Mannvaasam communicates with uncommon clarity. The turmeric matched
          the approved sample exactly, and every document arrived before we
          asked.”
        </blockquote>
        <div className="quote-person">
          <strong>Arun Mehta</strong>
          <span>Procurement Director · Saffron & Co., Dubai</span>
        </div>
        <button className="text-link" onClick={() => go("/reviews")}>
          Read client stories <Arrow />
        </button>
      </section>

      <Cta go={go} />
    </main>
  )
}
