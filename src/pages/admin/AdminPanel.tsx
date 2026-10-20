import { useState } from "react"
import AddUserPanel from "./AddUserPanel"
import EnquiriesPanel from "./EnquiriesPanel"
import FaqsPanel from "./FaqsPanel"
import PricesPanel from "./PricesPanel"
import ProductsPanel from "./ProductsPanel"
import ReviewsPanel from "./ReviewsPanel"

type AdminPanelProps = {
  username: string
  onLogout: () => void
}

const tabs = [
  { id: "enquiries", label: "Enquiries", Panel: EnquiriesPanel },
  { id: "prices", label: "Daily prices", Panel: PricesPanel },
  { id: "products", label: "Products", Panel: ProductsPanel },
  { id: "users", label: "Add user", Panel: AddUserPanel },
  { id: "reviews", label: "Reviews", Panel: ReviewsPanel },
  { id: "faqs", label: "FAQs", Panel: FaqsPanel },
] as const

type TabId = typeof tabs[number]["id"]

export default function AdminPanel({ username, onLogout }: AdminPanelProps) {
  const [active, setActive] = useState<TabId>("enquiries")
  const ActivePanel =
    tabs.find((tab) => tab.id === active)?.Panel ?? EnquiriesPanel

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Mannvaasam Admin</h1>
        <div className="admin-header-meta">
          <span>Signed in as {username}</span>
          <button className="admin-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>
      <nav className="admin-tabs" role="tablist" aria-label="Admin sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? "admin-tab active" : "admin-tab"}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section className="admin-column admin-tab-panel" role="tabpanel">
        <ActivePanel />
      </section>
    </div>
  )
}
