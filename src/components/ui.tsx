import type { ReactNode } from "react"
import { productPath } from "../lib/products"
import type { DailyPrice, Go, Product } from "../types"

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={diagonal ? "icon diagonal" : "icon"}
    >
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  )
}

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="state-block state-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="state-block state-error-block" role="alert">
      <span className="state-icon" aria-hidden="true">
        !
      </span>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="state-retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function Mark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 42" className="mark">
      <path d="M21 37V13M21 26c-7 0-12-4-13-11 7 0 12 4 13 11ZM21 20c7 0 12-4 13-11-7 0-12 4-13 11Z" />
    </svg>
  )
}

export function Button({
  children,
  onClick,
  tone = "dark",
  type = "button",
}: {
  children: ReactNode
  onClick?: () => void
  tone?: "dark" | "light" | "outline"
  type?: "button" | "submit"
}) {
  return (
    <button className={`button button-${tone}`} onClick={onClick} type={type}>
      <span>{children}</span>
      <Arrow diagonal />
    </button>
  )
}

export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode
  light?: boolean
}) {
  return (
    <div className={`eyebrow ${light ? "eyebrow-light" : ""}`}>{children}</div>
  )
}

export function SectionTitle({
  label,
  title,
  intro,
}: {
  label: string
  title: ReactNode
  intro?: string
}) {
  return (
    <div className="section-title reveal">
      <Eyebrow>{label}</Eyebrow>
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  )
}

export function PageHero({
  label,
  title,
  copy,
}: {
  label: string
  title: ReactNode
  copy: string
}) {
  return (
    <section className="page-hero">
      <Eyebrow>{label}</Eyebrow>
      <h1>{title}</h1>
      <p>{copy}</p>
    </section>
  )
}

export function Cta({ go }: { go: Go }) {
  return (
    <section className="cta">
      <Eyebrow light>Let’s move good things forward</Eyebrow>
      <h2>
        Your next shipment
        <br />
        starts with a <em>conversation.</em>
      </h2>
      <Button tone="light" onClick={() => go("/enquiry")}>
        Start an enquiry
      </Button>
    </section>
  )
}

export function StarRating({
  rating,
  max = 5,
}: {
  rating: number
  max?: number
}) {
  return (
    <div className="star-rating" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span className={i < rating ? "star filled" : "star"} key={i}>
          ★
        </span>
      ))}
    </div>
  )
}

export function StarRatingInput({
  value,
  onChange,
  max = 5,
}: {
  value: number
  onChange: (value: number) => void
  max?: number
}) {
  return (
    <div
      className="star-rating star-rating-input"
      role="radiogroup"
      aria-label="Your rating"
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1
        return (
          <button
            className={star <= value ? "star filled" : "star"}
            onClick={() => onChange(star)}
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            type="button"
            key={star}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

export function PriceTable({
  prices,
  compact = false,
}: {
  prices: DailyPrice[]
  compact?: boolean
}) {
  const shown = compact ? prices.slice(0, 4) : prices
  return (
    <div className="price-table">
      <div className="price-row price-head">
        <span>Product</span>
        <span>Price</span>
        <span>Unit</span>
        <span>Currency</span>
        <span>Updated</span>
      </div>
      {shown.map((row, i) => (
        <div className="price-row" key={row.id}>
          <span>
            <i>{String(i + 1).padStart(2, "0")}</i>
            {row.productName}
          </span>
          <strong>{row.price}</strong>
          <span>{row.unit}</span>
          <span>{row.currency}</span>
          <span>
            <b className="live-dot" />
            {row.updatedLabel}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ProductTile({
  product,
  index,
  go,
}: {
  product: Product
  index: number
  go: Go
}) {
  const href = productPath(product.slug)
  return (
    <article className={`product-tile product-${index + 1} reveal`}>
      <button
        className="product-image"
        onClick={() => go(href)}
        aria-label={`View ${product.name}`}
      >
        <img src={product.image} alt={product.alt} />
        <span className="image-index">0{index + 1}</span>
      </button>
      <div className="product-meta">
        <div>
          <span>
            {product.category} · {product.origin}
          </span>
          <h3>{product.name}</h3>
        </div>
        <div className="product-price">
          <strong>{product.price}</strong>
          <span>{product.unit}</span>
        </div>
      </div>
      <button className="text-link" onClick={() => go(href)}>
        View specification <Arrow />
      </button>
    </article>
  )
}
