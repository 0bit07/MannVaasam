import { images } from "../data"
import type { Go } from "../types"
import { Cta, Eyebrow, PageHero, SectionTitle } from "../components/ui"

export default function About({ go }: { go: Go }) {
  return (
    <main>
      <PageHero
        label="Our story"
        title={
          <>
            Trade with roots.
            <br />
            <em>Partnership without borders.</em>
          </>
        }
        copy="We connect India’s most dependable growers with businesses that value quality, provenance and a better way to trade."
      />
      <section className="story-grid section">
        <img
          src={images.palms}
          alt="Palm trees among lush green farmland in Tamil Nadu"
        />
        <div>
          <Eyebrow>Born from the soil</Eyebrow>
          <h2>
            A name that carries
            <br />
            <em>our purpose.</em>
          </h2>
          <p>
            In Tamil, Mannvaasam is the unmistakable fragrance that rises when
            rain meets earth. It evokes memory, origin and belonging—the values
            at the heart of how we source.
          </p>
          <p>
            Founded in Karur, we built Mannvaasam to make agricultural trade
            more transparent. We work closely with farmer groups, processors and
            logistics partners, bringing one accountable point of contact to
            every shipment.
          </p>
        </div>
      </section>
      <section className="stats">
        {[
          ["18+", "Trade destinations"],
          ["42", "Verified source partners"],
          ["96%", "On-time shipment rate"],
          ["100%", "Pre-shipment inspected"],
        ].map(([n, l]) => (
          <div key={l}>
            <strong>{n}</strong>
            <span>{l}</span>
          </div>
        ))}
      </section>
      <section className="values section">
        <SectionTitle
          label="What guides us"
          title={
            <>
              Old-world integrity.
              <br />
              <em>Modern trade discipline.</em>
            </>
          }
        />
        <div className="values-grid">
          {[
            [
              "01",
              "Source honestly",
              "We know where our goods begin, who grows them and how they are handled.",
            ],
            [
              "02",
              "Specify clearly",
              "No vague grades or shifting expectations. Every parameter is agreed and documented.",
            ],
            [
              "03",
              "Deliver responsibly",
              "We optimise packing and routes to protect both product and resources.",
            ],
          ].map(([n, t, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <Cta go={go} />
    </main>
  )
}
