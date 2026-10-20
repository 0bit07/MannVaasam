import { FormEvent, useMemo, useRef, useState } from "react"
import { useReviews } from "../hooks/useReviews"
import type { Go, Review } from "../types"
import {
  Button,
  Cta,
  ErrorState,
  Eyebrow,
  Loader,
  PageHero,
  StarRating,
  StarRatingInput,
} from "../components/ui"

type ReviewCardProps = {
  review: Review
  index: number
}

function ReviewCard({ review, index }: ReviewCardProps) {
  return (
    <article>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <StarRating rating={review.rating} />
      <blockquote>“{review.comment}”</blockquote>
      <div>
        <strong>{review.name}</strong>
        <small>
          {review.company} · {review.date}
        </small>
      </div>
    </article>
  )
}

type ReviewListProps = {
  reviews: Review[]
}

function ReviewList({ reviews }: ReviewListProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const sliding = reviews.length > 4

  function scrollByCard(direction: number) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector("article")
    const distance = card
      ? card.getBoundingClientRect().width
      : track.clientWidth
    track.scrollBy({ left: direction * distance, behavior: "smooth" })
  }

  if (!sliding) {
    return (
      <section className="reviews-grid section">
        {reviews.map((review, index) => (
          <ReviewCard key={review.id} review={review} index={index} />
        ))}
      </section>
    )
  }

  return (
    <section className="reviews-slider section">
      <div className="reviews-slider-bar">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous reviews"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next reviews"
        >
          →
        </button>
      </div>
      <div className="reviews-slider-track" ref={trackRef}>
        {reviews.map((review, index) => (
          <ReviewCard key={review.id} review={review} index={index} />
        ))}
      </div>
    </section>
  )
}

export default function Reviews({ go }: { go: Go }) {
  const { reviews, loading, error: loadError, addReview, reload } = useReviews()
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const average = useMemo(() => {
    if (reviews.length === 0) return 0
    return (
      reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length
    )
  }, [reviews])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!comment.trim()) {
      setError("Please add a few words about your experience.")
      return
    }
    await addReview({
      name: name.trim() || "Anonymous buyer",
      company: company.trim() || "Verified partner",
      rating,
      comment: comment.trim(),
    })
    setName("")
    setCompany("")
    setRating(5)
    setComment("")
    setError("")
    setSent(true)
  }

  return (
    <main>
      <PageHero
        label="Partner stories"
        title={
          <>
            Trust is earned
            <br />
            <em>one shipment at a time.</em>
          </>
        }
        copy="A few words from buyers who depend on us for quality, consistency and responsive trade support."
      />

      <section className="reviews-summary">
        <strong>{average.toFixed(1)}</strong>
        <div>
          <StarRating rating={Math.round(average)} />
          <span>
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      {loading && reviews.length === 0 ? (
        <section className="section">
          <Loader label="Loading reviews…" />
        </section>
      ) : (
        <ReviewList reviews={reviews} />
      )}
      {loadError && reviews.length === 0 && (
        <section className="section">
          <ErrorState message={loadError} onRetry={reload} />
        </section>
      )}
      {loadError && reviews.length > 0 && (
        <p className="data-error section">{loadError}</p>
      )}

      <section className="review-form-layout section">
        <div>
          <Eyebrow>Share your experience</Eyebrow>
          <h2>
            Shipped with us?
            <br />
            <em>Tell other buyers.</em>
          </h2>
          <p>
            Your comment appears on this page right away and helps other trade
            partners decide with confidence.
          </p>
        </div>
        {sent ? (
          <div className="success">
            <span>✓</span>
            <Eyebrow>Thank you</Eyebrow>
            <h3>Your review is live.</h3>
            <p>We appreciate you taking the time to share your experience.</p>
            <Button tone="outline" onClick={() => setSent(false)}>
              Write another review
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="review-form">
            <div className="field-row">
              <label>
                Your name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label>
                Company
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Company name"
                />
              </label>
            </div>
            <label>
              Your rating
              <StarRatingInput value={rating} onChange={setRating} />
            </label>
            <label>
              Your comment
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us about quality, communication or delivery."
              />
            </label>
            {error && <small className="form-error">{error}</small>}
            <Button type="submit">Post review</Button>
          </form>
        )}
      </section>

      <Cta go={go} />
    </main>
  )
}
