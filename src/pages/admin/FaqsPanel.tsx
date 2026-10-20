import { FormEvent, useState } from "react"
import { ErrorState, Loader } from "../../components/ui"
import { apiFetch } from "../../lib/api"
import { describeApiError, useApiQuery } from "../../lib/apiResource"
import type { Faq } from "../../types"

export default function FaqsPanel() {
  const {
    data: faqs,
    loading,
    error,
    reload,
    setData,
  } = useApiQuery<Faq[]>("/api/faqs", {
    initialData: [],
    timeoutMessage: "FAQs took too long to load.",
    fallbackMessage: "Could not load FAQs.",
  })

  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState("")

  async function createFaq(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setSubmitting(true)
    try {
      const created = await apiFetch<Faq>("/api/faqs", {
        method: "POST",
        body: JSON.stringify({ question, answer }),
      })
      setQuestion("")
      setAnswer("")
      setData((current) => [...current, created])
    } catch (err) {
      setFormError(
        describeApiError(err, { fallback: "Could not add the FAQ." }),
      )
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(faq: Faq) {
    setEditingId(faq.id)
    setEditQuestion(faq.question)
    setEditAnswer(faq.answer)
    setRowError("")
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    setSavingId(id)
    setRowError("")
    try {
      const updated = await apiFetch<Faq>(
        `/api/faqs/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify({ question: editQuestion, answer: editAnswer }),
        },
      )
      setData((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      )
      setEditingId(null)
    } catch (err) {
      setRowError(
        describeApiError(err, { fallback: "Could not update the FAQ." }),
      )
    } finally {
      setSavingId(null)
    }
  }

  async function deleteFaq(faq: Faq) {
    if (!window.confirm(`Delete this FAQ?\n\n${faq.question}`)) return
    setRowError("")
    try {
      await apiFetch(`/api/faqs/${encodeURIComponent(faq.id)}`, {
        method: "DELETE",
      })
      setData((current) => current.filter((item) => item.id !== faq.id))
    } catch (err) {
      setRowError(
        describeApiError(err, { fallback: "Could not delete the FAQ." }),
      )
    }
  }

  return (
    <>
      <h2>FAQs</h2>
      <p className="admin-column-sub">
        Add, edit, or remove the questions shown on the FAQ page.
      </p>
      <button className="admin-refresh" type="button" onClick={reload}>
        Refresh
      </button>
      <form className="admin-form" onSubmit={createFaq}>
        <label>
          Question
          <input
            required
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What do buyers ask?"
          />
        </label>
        <label>
          Answer
          <textarea
            required
            rows={3}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write a clear answer."
          />
        </label>
        {formError && <p className="admin-error">{formError}</p>}
        <button className="admin-submit" type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add FAQ"}
        </button>
      </form>
      {loading && <Loader label="Loading FAQs…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {rowError && <p className="admin-error">{rowError}</p>}
      {!loading && !error && faqs.length === 0 && (
        <p className="admin-empty">No FAQs yet.</p>
      )}
      {!loading && !error && (
        <div className="admin-list">
          {faqs.map((faq) =>
            editingId === faq.id ? (
              <form
                className="admin-form"
                key={faq.id}
                onSubmit={(event) => saveEdit(event, faq.id)}
              >
                <label>
                  Question
                  <input
                    required
                    value={editQuestion}
                    onChange={(event) => setEditQuestion(event.target.value)}
                  />
                </label>
                <label>
                  Answer
                  <textarea
                    required
                    rows={3}
                    value={editAnswer}
                    onChange={(event) => setEditAnswer(event.target.value)}
                  />
                </label>
                <div className="admin-product-actions">
                  <button
                    className="admin-submit"
                    type="submit"
                    disabled={savingId === faq.id}
                  >
                    {savingId === faq.id ? "Saving…" : "Save"}
                  </button>
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <article className="admin-card" key={faq.id}>
                <p>
                  <b>{faq.question}</b>
                </p>
                <p>{faq.answer}</p>
                <div className="admin-product-actions">
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={() => startEdit(faq)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-link-btn danger"
                    type="button"
                    onClick={() => deleteFaq(faq)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </>
  )
}
