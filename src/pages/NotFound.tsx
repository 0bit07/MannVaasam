import type { Go } from "../types"
import { Arrow, Eyebrow } from "../components/ui"

export default function NotFound({ go }: { go: Go }) {
  return (
    <main>
      <section className="page-hero">
        <Eyebrow>Page not found</Eyebrow>
        <h1>
          This page is
          <br />
          <em>not on the map.</em>
        </h1>
        <p>
          The address may have changed. Return home or browse the catalogue.
        </p>
        <button className="text-link" onClick={() => go("/")}>
          Back to home <Arrow />
        </button>
      </section>
    </main>
  )
}
