import { FormEvent, useState } from "react"
import { catalogueProductNames } from "../data"
import { useProducts } from "../hooks/useProducts"
import { apiFetch } from "../lib/api"
import type { EnquiryType, NewEnquiry } from "../types"
import { Button, Eyebrow, PageHero } from "../components/ui"

export default function Enquiry({ contact = false }: { contact?: boolean }) {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts()
  const catalogueReady = !productsLoading && !productsError
  const productNames =
    products.length > 0
      ? products.map((product) => product.name)
      : catalogueReady
        ? []
        : catalogueProductNames
  const [sent, setSent] = useState(false)
  const [type, setType] = useState<EnquiryType>("buy")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const data = new FormData(event.currentTarget)
    const payload: NewEnquiry = {
      type: contact ? "contact" : type,
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      product: String(data.get("product") ?? ""),
      volume: String(data.get("volume") ?? ""),
      message: String(data.get("message") ?? ""),
    }
    setSubmitting(true)
    try {
      await apiFetch("/api/enquiries", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setSent(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong submitting your enquiry. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <PageHero
        label={contact ? "Contact" : "Trade enquiry"}
        title={
          contact ? (
            <>
              Good business starts
              <br />
              <em>with clear conversation.</em>
            </>
          ) : (
            <>
              Tell us what you need.
              <br />
              <em>We’ll map the right route.</em>
            </>
          )
        }
        copy={
          contact
            ? "Speak with our export team in Bangalore. We reply to trade enquiries within one working day."
            : "Share your product, volume and destination. Our export desk will respond with availability and next steps."
        }
      />
      <section className="form-layout section">
        <aside>
          <Eyebrow>{contact ? "Trade desk" : "What happens next"}</Eyebrow>
          {contact ? (
            <>
              <h3>Bangalore, India</h3>
              <p>
                No. 13, 1st Cross, Chaitanya Dhama Layout
                <br />
                KSR Main Road, Horamavu Agara
                <br />
                Bangalore 560043
              </p>
              <a href="tel:+91 6383574998">+91 6383574998</a>
              <a href="mailto:mannvaasamglobalexim@gmail.com">
                mannvaasamglobalexim@gmail.com
              </a>
              <div className="office-hours">
                <span>Mon–Fri</span>
                <strong>09:30–18:00 IST</strong>
              </div>
            </>
          ) : (
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>Requirement review</strong>
                  <p>We assess grade, quantity and destination.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Availability & quote</strong>
                  <p>Receive a clear offer with specifications.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Sample & shipment</strong>
                  <p>Approve quality and confirm dispatch.</p>
                </div>
              </li>
            </ol>
          )}
        </aside>
        {sent ? (
          <div className="success">
            <span>✓</span>
            <Eyebrow>Message received</Eyebrow>
            <h2>
              Thank you.
              <br />
              <em>We’ll be in touch shortly.</em>
            </h2>
            <p>
              Your enquiry has reached our trade desk. A member of our team will
              reply within one working day.
            </p>
            <Button tone="outline" onClick={() => setSent(false)}>
              Send another enquiry
            </Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {!contact && (
              <div className="type-toggle">
                <button
                  type="button"
                  className={type === "buy" ? "active" : ""}
                  onClick={() => setType("buy")}
                >
                  I want to buy
                </button>
                <button
                  type="button"
                  className={type === "sell" ? "active" : ""}
                  onClick={() => setType("sell")}
                >
                  I want to sell
                </button>
              </div>
            )}
            <div className="field-row">
              <label>
                Full name
                <input required name="name" placeholder="Your name" />
              </label>
              <label>
                Company
                <input required name="company" placeholder="Company name" />
              </label>
            </div>
            <div className="field-row">
              <label>
                Work email
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                />
              </label>
              <label>
                Phone
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="+00 000 000 000"
                />
              </label>
            </div>
            <div className="field-row">
              <label>
                Product
                <select
                  required
                  name="product"
                  defaultValue=""
                  disabled={productNames.length === 0}
                >
                  <option value="" disabled>
                    Select a product
                  </option>
                  {productNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {productsError && products.length === 0 && (
                  <small>
                    The live catalogue could not be loaded, so the standard
                    products are listed instead.
                  </small>
                )}
                {catalogueReady && products.length === 0 && (
                  <small>No products have been added yet.</small>
                )}
              </label>
              <label>
                Volume
                <input
                  required
                  name="volume"
                  placeholder="e.g. 20 metric tonnes"
                />
              </label>
            </div>
            <label>
              Destination / message
              <textarea
                required
                name="message"
                rows={5}
                placeholder="Tell us the destination port, grade, packing or any other requirements."
              />
            </label>
            {error && <small className="form-error">{error}</small>}
            <Button type="submit">
              {submitting
                ? "Submitting…"
                : contact
                  ? "Send message"
                  : "Submit enquiry"}
            </Button>
            <small>
              By submitting, you agree to be contacted about this enquiry. We
              never sell your data.
            </small>
          </form>
        )}
      </section>
    </main>
  )
}
