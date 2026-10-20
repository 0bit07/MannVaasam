import { useState } from "react"
import { ErrorState, Loader, StarRating } from "../../components/ui"
import { apiFetch } from "../../lib/api"
import { describeApiError, useApiQuery } from "../../lib/apiResource"
import type { Review } from "../../types"

export default function ReviewsPanel() {
  const {
    data: reviews,
    loading,
    error,
    reload,
    setData,
  } = useApiQuery<Review[]>("/api/reviews", {
    initialData: [],
    timeoutMessage: "Reviews took too long to load.",
    fallbackMessage: "Could not load reviews.",
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState("")

  async function deleteReview(review: Review) {
    const confirmed = window.confirm(
      `Delete ${review.name}'s review and its ${review.rating}-star rating?`,
    )
    if (!confirmed) return
    setDeletingId(review.id)
    setDeleteError("")
    try {
      await apiFetch(`/api/reviews/${encodeURIComponent(review.id)}`, {
        method: "DELETE",
      })
      setData((current) => current.filter((item) => item.id !== review.id))
    } catch (err) {
      setDeleteError(
        describeApiError(err, { fallback: "Could not delete the review." }),
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <h2>Reviews</h2>
      <p className="admin-column-sub">
        Remove a partner review and the star rating shown with it.
      </p>
      <button className="admin-refresh" type="button" onClick={reload}>
        Refresh
      </button>
      {loading && <Loader label="Loading reviews…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {deleteError && <p className="admin-error">{deleteError}</p>}
      {!loading && !error && reviews.length === 0 && (
        <p className="admin-empty">No reviews yet.</p>
      )}
      {!loading && !error && (
        <div className="admin-list">
          {reviews.map((review) => (
            <article className="admin-card" key={review.id}>
              <div className="admin-card-top">
                <b>
                  {review.name} · {review.rating} star
                  {review.rating === 1 ? "" : "s"}
                </b>
                <span>{review.date}</span>
              </div>
              <StarRating rating={review.rating} />
              <p>{review.comment}</p>
              <small>{review.company}</small>
              <button
                className="admin-link-btn danger"
                type="button"
                disabled={deletingId === review.id}
                onClick={() => deleteReview(review)}
              >
                {deletingId === review.id ? "Deleting…" : "Delete review"}
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
