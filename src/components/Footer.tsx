import { nav } from "../data"
import type { Go } from "../types"
import { Mark } from "./ui"

export default function Footer({ go }: { go: Go }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand">
            <Mark /> MANNVAASAM
          </div>
          <p>
            From rooted origins
            <br />
            to global destinations.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <small>Explore</small>
            {nav.slice(0, 4).map((item) => (
              <button key={item.path} onClick={() => go(item.path)}>
                {item.label}
              </button>
            ))}
          </div>
          <div>
            <small>Connect</small>
            <button onClick={() => go("/enquiry")}>Buy / Sell Enquiry</button>
            <button onClick={() => go("/contact")}>Contact</button>
            <a href="mailto:mannvasamglobalexim@gmail.com">
              mannvasamglobalexim@gmail.com
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Mannvaasam Global Exim</span>
        <span>Bangalore · India</span>
        <span>IEC & APEDA Registered</span>
      </div>
    </footer>
  )
}
