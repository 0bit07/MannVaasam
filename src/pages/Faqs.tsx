import { useState } from "react"
import { useFaqs } from "../hooks/useFaqs"
import type { Go } from "../types"
import { Button, Loader, PageHero } from "../components/ui"

export default function Faqs({ go }: { go: Go }) {
  const { faqs, loading, error } = useFaqs()
  const [open, setOpen] = useState(0)
  return (
    <main>
      <PageHero
        label="Frequently asked"
        title={
          <>
            The practical details,
            <br />
            <em>answered clearly.</em>
          </>
        }
        copy="Sourcing, samples, logistics and quality—find the essentials here or speak directly with our trade desk."
      />
      <section className="faq-list section">
        {loading && faqs.length === 0 && <Loader label="Loading questions…" />}
        {error && faqs.length > 0 && (
          <p className="data-error">
            Showing the saved questions. The live list could not be loaded.
          </p>
        )}
        {faqs.map((faq, i) => (
          <article className={open === i ? "open" : ""} key={faq.id}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{faq.question}</strong>
              <b>{open === i ? "−" : "+"}</b>
            </button>
            <div>
              <p>{faq.answer}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="faq-contact">
        <span>Still have a question?</span>
        <Button tone="outline" onClick={() => go("/contact")}>
          Ask our trade desk
        </Button>
      </section>
    </main>
  )
}
