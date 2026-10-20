import { useState } from "react"
import { ErrorState, Loader } from "../../components/ui"
import { apiFetch } from "../../lib/api"
import { describeApiError, useApiQuery } from "../../lib/apiResource"
import type { Enquiry, EnquiryStatus } from "../../types"

type StatusFilter = "all" | EnquiryStatus

export default function EnquiriesPanel() {
  const {
    data: enquiries,
    loading,
    error,
    reload,
    setData,
  } = useApiQuery<Enquiry[]>("/api/enquiries", {
    initialData: [],
    fallbackMessage: "Could not load enquiries.",
  })
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [savingId, setSavingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState("")

  const todoCount = enquiries.filter(
    (item) => item.status !== "completed",
  ).length
  const doneCount = enquiries.filter(
    (item) => item.status === "completed",
  ).length
  const shown = enquiries.filter((item) => {
    if (filter === "todo") return item.status !== "completed"
    if (filter === "completed") return item.status === "completed"
    return true
  })

  async function setStatus(enquiry: Enquiry, status: EnquiryStatus) {
    if (enquiry.status === status || savingId !== null) return
    setSavingId(enquiry.id)
    setActionError("")
    try {
      const updated = await apiFetch<Enquiry>(`/api/enquiries/${enquiry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      setData((current) =>
        current.map((item) => (item.id === enquiry.id ? updated : item)),
      )
    } catch (err) {
      setActionError(
        describeApiError(err, { fallback: "Could not update the enquiry." }),
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <h2>Enquiries</h2>
      <p className="admin-column-sub">
        Submitted via the "Enquire now" and contact forms. Mark each one to do
        or completed as you work through it.
      </p>
      <button className="admin-refresh" onClick={reload}>
        Refresh
      </button>
      <div className="admin-filters" role="group" aria-label="Enquiry status">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({enquiries.length})
        </button>
        <button
          type="button"
          className={filter === "todo" ? "active" : ""}
          onClick={() => setFilter("todo")}
        >
          To do ({todoCount})
        </button>
        <button
          type="button"
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completed ({doneCount})
        </button>
      </div>
      {loading && <Loader label="Loading enquiries…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {actionError && <p className="admin-error">{actionError}</p>}
      {!loading && !error && shown.length === 0 && (
        <p className="admin-empty">
          {filter === "completed"
            ? "No completed enquiries yet."
            : filter === "todo"
              ? "Nothing left to do."
              : "No enquiries yet."}
        </p>
      )}
      {!loading && !error && shown.length > 0 && (
        <div className="admin-list">
          {shown.map((enquiry) => (
            <article
              className={
                enquiry.status === "completed"
                  ? "admin-card is-done"
                  : "admin-card"
              }
              key={enquiry.id}
            >
              <div className="admin-card-top">
                <b>{enquiry.type.toUpperCase()}</b>
                <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
              </div>
              <strong>
                {enquiry.name} · {enquiry.company}
              </strong>
              <span>
                {enquiry.email} · {enquiry.phone}
              </span>
              {enquiry.product && (
                <span>
                  {enquiry.product} — {enquiry.volume}
                </span>
              )}
              <p>{enquiry.message}</p>
              <div className="admin-status" role="group" aria-label="Status">
                <button
                  type="button"
                  className={
                    enquiry.status !== "completed" ? "active-todo" : ""
                  }
                  disabled={savingId === enquiry.id}
                  onClick={() => setStatus(enquiry, "todo")}
                >
                  To do
                </button>
                <button
                  type="button"
                  className={
                    enquiry.status === "completed" ? "active-done" : ""
                  }
                  disabled={savingId === enquiry.id}
                  onClick={() => setStatus(enquiry, "completed")}
                >
                  Completed
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
