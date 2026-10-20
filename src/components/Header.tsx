import { useState } from "react"
import { nav } from "../data"
import type { Go } from "../types"
import { Arrow, Mark } from "./ui"

function isCurrent(path: string, itemPath: string) {
  if (itemPath === "/products") {
    return path === "/products" || path.startsWith("/products/")
  }
  return path === itemPath
}

type HeaderProps = {
  path: string
  go: Go
  onBrandClick: () => void
}

export default function Header({ path, go, onBrandClick }: HeaderProps) {
  const [open, setOpen] = useState(false)
  return (
    <header className="header">
      <button
        className="brand"
        onClick={onBrandClick}
        aria-label="Mannvaasam home"
      >
        <Mark />
        <span className="brand-name">MANNVAASAM</span>
        <span className="brand-sub">GLOBAL EXIM</span>
      </button>
      <nav
        className={`nav ${open ? "nav-open" : ""}`}
        aria-label="Primary navigation"
      >
        {nav.map((item) => (
          <button
            className={
              isCurrent(path, item.path) ? "nav-link active" : "nav-link"
            }
            onClick={() => {
              go(item.path)
              setOpen(false)
            }}
            key={item.path}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="header-enquire" onClick={() => go("/enquiry")}>
        Enquire <Arrow diagonal />
      </button>
      <button
        className={`menu ${open ? "menu-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <span />
        <span />
      </button>
    </header>
  )
}
