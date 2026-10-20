import { useCallback } from "react"
import { reviews as seedReviews } from "../data"
import { abortAfter, apiFetch } from "../lib/api"
import { describeApiError, useApiQuery } from "../lib/apiResource"
import type { Review } from "../types"

const STORAGE_KEY = "mannvaasam-submitted-reviews"

function loadSubmittedReviews(): Review[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSubmittedReviews(reviews: Review[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
}

export type NewReview = {
  name: string
  company: string
  rating: number
  comment: string
}

function makeLocalReview(entry: NewReview): Review {
  return {
    id: `review-${Date.now()}`,
    name: entry.name,
    company: entry.company,
    rating: entry.rating,
    comment: entry.comment,
    date: new Date().toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    }),
  }
}

export function useReviews() {
  const { data, loading, error, reload, setData, setError } =
    useApiQuery<Review[]>("/api/reviews", {
      initialData: [],
      timeoutMessage: "Reviews took too long to load.",
      fallbackMessage: "Could not load reviews.",
      fallbackData: () => [...loadSubmittedReviews(), ...seedReviews],
    })

  const addReview = useCallback(
    async (entry: NewReview) => {
      const timeout = abortAfter(5000)
      try {
        const created = await apiFetch<Review>("/api/reviews", {
          method: "POST",
          body: JSON.stringify(entry),
          signal: timeout.signal,
        })
        setData((current) => [
          created,
          ...current.filter((review) => review.id !== created.id),
        ])
        setError(null)
        return created
      } catch (err) {
        const review = makeLocalReview(entry)
        saveSubmittedReviews([review, ...loadSubmittedReviews()])
        setData((current) => [review, ...current])
        const base = describeApiError(err, {
          timeout: "The server took too long.",
          fallback: "",
        })
        setError(
          base
            ? `${base} This review is saved in this browser only.`
            : "This review is saved in this browser only.",
        )
        return review
      } finally {
        timeout.cancel()
      }
    },
    [setData, setError],
  )

  return { reviews: data, loading, error, addReview, reload }
}
