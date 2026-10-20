import { FormEvent, useState } from "react"
import { ErrorState, Loader } from "../../components/ui"
import { apiFetch } from "../../lib/api"
import { describeApiError, useApiQuery } from "../../lib/apiResource"
import type { DailyPrice } from "../../types"

type PriceDraft = {
  productName: string
  price: string
  unit: string
  currency: string
}

const emptyDraft: PriceDraft = {
  productName: "",
  price: "",
  unit: "",
  currency: "USD",
}

export default function PricesPanel() {
  const {
    data: prices,
    loading,
    error,
    reload,
    setData,
  } = useApiQuery<DailyPrice[]>("/api/prices", {
    initialData: [],
    timeoutMessage: "Daily prices took too long to load.",
    fallbackMessage: "Could not load daily prices.",
  })
  const [draft, setDraft] = useState<PriceDraft>(emptyDraft)
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<PriceDraft>(emptyDraft)
  const [editError, setEditError] = useState("")
  const [savingId, setSavingId] = useState<number | null>(null)

  function updateDraft(key: keyof PriceDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateEdit(key: keyof PriceDraft, value: string) {
    setEditDraft((current) => ({ ...current, [key]: value }))
  }

  async function createPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setSubmitting(true)
    try {
      const created = await apiFetch<DailyPrice>("/api/prices", {
        method: "POST",
        body: JSON.stringify(draft),
      })
      setDraft(emptyDraft)
      setData((current) => [...current, created])
    } catch (err) {
      setFormError(
        describeApiError(err, { fallback: "Could not add the price." }),
      )
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(price: DailyPrice) {
    setEditingId(price.id)
    setEditError("")
    setEditDraft({
      productName: price.productName,
      price: price.price,
      unit: price.unit,
      currency: price.currency,
    })
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault()
    setSavingId(id)
    setEditError("")
    try {
      const updated = await apiFetch<DailyPrice>(`/api/prices/${id}`, {
        method: "PUT",
        body: JSON.stringify(editDraft),
      })
      setData((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      )
      setEditingId(null)
    } catch (err) {
      setEditError(
        describeApiError(err, { fallback: "Could not update the price." }),
      )
    } finally {
      setSavingId(null)
    }
  }

  async function deletePrice(price: DailyPrice) {
    if (!window.confirm(`Remove ${price.productName} from today's board?`)) {
      return
    }
    setEditError("")
    try {
      await apiFetch(`/api/prices/${price.id}`, { method: "DELETE" })
      setData((current) => current.filter((item) => item.id !== price.id))
    } catch (err) {
      setEditError(
        describeApiError(err, { fallback: "Could not remove the price." }),
      )
    }
  }

  return (
    <>
      <h2>Daily prices</h2>
      <p className="admin-column-sub">
        This is the price board on the home page and Daily Prices page. It is
        separate from the product catalogue.
      </p>
      <button className="admin-refresh" type="button" onClick={reload}>
        Refresh
      </button>
      <form className="admin-form" onSubmit={createPrice}>
        <label>
          Product
          <input
            required
            value={draft.productName}
            onChange={(event) => updateDraft("productName", event.target.value)}
            placeholder="e.g. Erode Turmeric"
          />
        </label>
        <div className="admin-form-row">
          <label>
            Today's price
            <input
              required
              value={draft.price}
              onChange={(event) => updateDraft("price", event.target.value)}
              placeholder="e.g. $2.48 or ₹210"
            />
          </label>
          <label>
            Unit
            <input
              required
              value={draft.unit}
              onChange={(event) => updateDraft("unit", event.target.value)}
              placeholder="e.g. kg"
            />
          </label>
        </div>
        <label>
          Currency
          <input
            required
            value={draft.currency}
            onChange={(event) => updateDraft("currency", event.target.value)}
            placeholder="USD"
          />
        </label>
        {formError && <p className="admin-error">{formError}</p>}
        <button className="admin-submit" type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add to today's board"}
        </button>
      </form>
      {loading && <Loader label="Loading prices…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {editError && <p className="admin-error">{editError}</p>}
      {!loading && !error && prices.length === 0 && (
        <p className="admin-empty">No prices on the board yet.</p>
      )}
      {!loading && !error && (
        <div className="admin-list">
          {prices.map((price) =>
            editingId === price.id ? (
              <form
                className="admin-form"
                key={price.id}
                onSubmit={(event) => saveEdit(event, price.id)}
              >
                <label>
                  Product
                  <input
                    required
                    value={editDraft.productName}
                    onChange={(event) =>
                      updateEdit("productName", event.target.value)
                    }
                  />
                </label>
                <div className="admin-form-row">
                  <label>
                    Today's price
                    <input
                      required
                      value={editDraft.price}
                      onChange={(event) =>
                        updateEdit("price", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Unit
                    <input
                      required
                      value={editDraft.unit}
                      onChange={(event) =>
                        updateEdit("unit", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label>
                  Currency
                  <input
                    required
                    value={editDraft.currency}
                    onChange={(event) =>
                      updateEdit("currency", event.target.value)
                    }
                  />
                </label>
                <div className="admin-product-actions">
                  <button
                    className="admin-submit"
                    type="submit"
                    disabled={savingId === price.id}
                  >
                    {savingId === price.id ? "Saving…" : "Save"}
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
              <article className="admin-card" key={price.id}>
                <div className="admin-card-top">
                  <b>{price.currency}</b>
                  <span>{price.updatedLabel}</span>
                </div>
                <strong>{price.productName}</strong>
                <span>
                  {price.price} / {price.unit}
                </span>
                <div className="admin-product-actions">
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={() => startEdit(price)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-link-btn danger"
                    type="button"
                    onClick={() => deletePrice(price)}
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
