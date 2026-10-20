import { FormEvent, useState } from "react"
import { ErrorState, Loader } from "../../components/ui"
import { useProducts } from "../../hooks/useProducts"
import { apiFetch } from "../../lib/api"
import { describeApiError } from "../../lib/apiResource"
import type { Product, ProductInput } from "../../types"

const emptyForm: ProductInput = {
  name: "",
  category: "",
  origin: "",
  price: "",
  unit: "",
  grade: "",
  image: "",
  alt: "",
  description: "",
}

export default function ProductsPanel() {
  const { products, loading, error, reload } = useProducts()
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProductInput>(emptyForm)
  const [editError, setEditError] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  function updateField(key: keyof ProductInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateEditField(key: keyof ProductInput, value: string) {
    setEditForm((current) => ({ ...current, [key]: value }))
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setSubmitting(true)
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(form),
      })
      setForm(emptyForm)
      await reload()
    } catch (err) {
      setFormError(
        describeApiError(err, { fallback: "Could not add the product." }),
      )
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(product: Product) {
    setEditingSlug(product.slug)
    setEditError("")
    setEditForm({
      name: product.name,
      category: product.category,
      origin: product.origin,
      price: product.price,
      unit: product.unit,
      grade: product.grade,
      image: product.image,
      alt: product.alt,
      description: product.description,
    })
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault()
    setEditError("")
    setSavingEdit(true)
    try {
      await apiFetch(`/api/products/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      })
      setEditingSlug(null)
      await reload()
    } catch (err) {
      setEditError(
        describeApiError(err, { fallback: "Could not update the product." }),
      )
    } finally {
      setSavingEdit(false)
    }
  }

  async function deleteProduct(slug: string) {
    if (!window.confirm("Remove this product from the portal?")) return
    try {
      await apiFetch(`/api/products/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      })
      await reload()
    } catch (err) {
      window.alert(
        describeApiError(err, { fallback: "Could not remove the product." }),
      )
    }
  }

  return (
    <>
      <h2>Products</h2>
      <p className="admin-column-sub">
        Add new products or update image, description and price.
      </p>

      <form className="admin-form" onSubmit={createProduct}>
        <div className="admin-form-row">
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g. Basmati Rice"
            />
          </label>
          <label>
            Category
            <input
              required
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="e.g. Grains"
            />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            Origin
            <input
              required
              value={form.origin}
              onChange={(event) => updateField("origin", event.target.value)}
              placeholder="e.g. Punjab, India"
            />
          </label>
          <label>
            Grade
            <input
              required
              value={form.grade}
              onChange={(event) => updateField("grade", event.target.value)}
              placeholder="e.g. Premium Grade A"
            />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            Price
            <input
              required
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="e.g. $4.20"
            />
          </label>
          <label>
            Unit
            <input
              required
              value={form.unit}
              onChange={(event) => updateField("unit", event.target.value)}
              placeholder="e.g. per kg"
            />
          </label>
        </div>
        <label>
          Image URL
          <input
            required
            type="url"
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
            placeholder="https://..."
          />
        </label>
        <label>
          Image alt text
          <input
            value={form.alt}
            onChange={(event) => updateField("alt", event.target.value)}
            placeholder="Short description of the photo"
          />
        </label>
        <label>
          Description
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Shown on the product detail page"
          />
        </label>
        {formError && <p className="admin-error">{formError}</p>}
        <button className="admin-submit" type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add product"}
        </button>
      </form>

      {loading && <Loader label="Loading products…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && (
        <div className="admin-list">
          {products.map((product) =>
            editingSlug === product.slug ? (
              <form
                className="admin-form"
                key={product.slug}
                onSubmit={(event) => saveEdit(event, product.slug)}
              >
                <div className="admin-form-row">
                  <label>
                    Name
                    <input
                      required
                      value={editForm.name}
                      onChange={(event) =>
                        updateEditField("name", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Category
                    <input
                      required
                      value={editForm.category}
                      onChange={(event) =>
                        updateEditField("category", event.target.value)
                      }
                    />
                  </label>
                </div>
                <div className="admin-form-row">
                  <label>
                    Price
                    <input
                      required
                      value={editForm.price}
                      onChange={(event) =>
                        updateEditField("price", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Unit
                    <input
                      required
                      value={editForm.unit}
                      onChange={(event) =>
                        updateEditField("unit", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label>
                  Image URL
                  <input
                    required
                    type="url"
                    value={editForm.image}
                    onChange={(event) =>
                      updateEditField("image", event.target.value)
                    }
                  />
                </label>
                <label>
                  Description
                  <textarea
                    required
                    rows={3}
                    value={editForm.description}
                    onChange={(event) =>
                      updateEditField("description", event.target.value)
                    }
                  />
                </label>
                {editError && <p className="admin-error">{editError}</p>}
                <div className="admin-product-actions">
                  <button
                    className="admin-submit"
                    type="submit"
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={() => setEditingSlug(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <article className="admin-card" key={product.slug}>
                <div className="admin-card-top">
                  <b>{product.category}</b>
                  <span>
                    {product.price} / {product.unit}
                  </span>
                </div>
                <strong>{product.name}</strong>
                <p>{product.description}</p>
                <div className="admin-product-actions">
                  <button
                    className="admin-link-btn"
                    onClick={() => startEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-link-btn danger"
                    onClick={() => deleteProduct(product.slug)}
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
