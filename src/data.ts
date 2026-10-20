import type { DailyPrice, Faq, Review } from "./types"

export const images = {
  field:
    "https://images.unsplash.com/photo-1744358399532-9769248a6d58?auto=format&fit=crop&w=1800&q=88",
  spice:
    "https://images.unsplash.com/photo-1775433205046-86e060feff06?auto=format&fit=crop&w=1400&q=88",
  powders:
    "https://images.unsplash.com/photo-1770999131111-590d9eaadcdb?auto=format&fit=crop&w=1400&q=88",
  coconuts:
    "https://images.unsplash.com/photo-1708884476326-b232fb6ce72c?auto=format&fit=crop&w=1400&q=88",
  corn: "https://images.unsplash.com/photo-1668885309844-5bb50f7c2e61?auto=format&fit=crop&w=1400&q=88",
  port: "https://images.unsplash.com/photo-1690995293820-de977158b460?auto=format&fit=crop&w=1600&q=88",
  palms:
    "https://images.unsplash.com/photo-1749026314459-3fb459710f01?auto=format&fit=crop&w=1500&q=88",
}

export const heroPlaces = [
  {
    id: "pollachi",
    name: "Pollachi, Tamil Nadu",
    coords: "11.0168° N",
    image: images.field,
    alt: "Coconut palms and farmland in Pollachi",
  },
  {
    id: "erode",
    name: "Erode, Tamil Nadu",
    coords: "11.3410° N",
    image: images.powders,
    alt: "Golden turmeric from the Erode belt",
  },
  {
    id: "kanchipuram",
    name: "Kanchipuram, Tamil Nadu",
    coords: "12.8342° N",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=88",
    alt: "A Kanchipuram silk saree with a gold border",
  },
  {
    id: "madurai",
    name: "Madurai, Tamil Nadu",
    coords: "9.9252° N",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=88",
    alt: "A temple tower in Madurai at dusk",
  },
]

export const catalogueProductNames = [
  "Erode Turmeric",
  "Fresh Coconuts",
  "Yellow Maize",
  "Green Cardamom",
  "Red Onion, Big",
  "Red Onion, Small",
  "Turmeric",
  "Dried Red Chilli",
  "Cocopeat Block",
  "Black Pepper",
  "Cardamom",
  "Coriander Seeds",
  "Coconut",
  "Rice",
  "Dal",
  "Fruits and Vegetables",
  "Tamarind",
  "Wheat",
  "Lemon",
  "Moringa Powder",
  "Curry Leaves",
  "Groundnuts",
]

export const reviews: Review[] = [
  {
    id: "layla-haddad",
    name: "Layla Haddad",
    company: "Al Noor Foods · UAE",
    rating: 5,
    comment:
      "The difference is their communication. We knew where the cargo was, what had been checked and exactly when every document would land.",
    date: "Feb 2025",
  },
  {
    id: "martin-de-vries",
    name: "Martin de Vries",
    company: "Nord Produce · Netherlands",
    rating: 5,
    comment:
      "Their coconut quality has been remarkably consistent across six shipments. Any question is answered quickly and with real detail.",
    date: "Jan 2025",
  },
  {
    id: "kenji-sato",
    name: "Kenji Sato",
    company: "Hikari Trading · Japan",
    rating: 4,
    comment:
      "Mannvaasam feels less like a supplier and more like our sourcing team in India. Transparent, practical and dependable.",
    date: "Dec 2024",
  },
  {
    id: "nadia-hassan",
    name: "Nadia Hassan",
    company: "Crescent Markets · Qatar",
    rating: 5,
    comment:
      "The sample, final cargo and lab report all aligned. That level of control makes repeat buying an easy decision.",
    date: "Nov 2024",
  },
]

export const faqs: Faq[] = [
  {
    id: "export-countries",
    question: "Which countries do you export to?",
    answer:
      "We currently serve buyers across the GCC, Southeast Asia, Europe and East Asia. New destinations are evaluated with our freight and compliance partners before quotation.",
  },
  {
    id: "samples",
    question: "Can you provide samples before an order?",
    answer:
      "Yes. Representative samples can be arranged for most dry commodities. Courier and testing costs may apply and can be adjusted against a confirmed order.",
  },
  {
    id: "trade-terms",
    question: "What trade terms do you offer?",
    answer:
      "We commonly quote FOB, CFR and CIF from Karur, Tuticorin, Cochin and Mundra. Other Incoterms can be discussed based on the product and destination.",
  },
  {
    id: "quality",
    question: "How do you verify product quality?",
    answer:
      "Lots are checked against an agreed specification before dispatch. Depending on the product, this may include moisture, size, residue, microbiological and third-party inspection reports.",
  },
  {
    id: "minimum-order",
    question: "What is your typical minimum order quantity?",
    answer:
      "Minimums vary by product: generally 5 MT for spices, one 20-foot container for grains, and 10,000 pieces for fresh coconuts.",
  },
  {
    id: "private-label",
    question: "Do you support private-label packaging?",
    answer:
      "Yes. Retail and foodservice formats are available for selected products, subject to packaging development, label compliance and minimum volumes.",
  },
]

export const prices: DailyPrice[] = [
  {
    id: 1,
    productName: "Erode Turmeric",
    price: "$2.48",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 2,
    productName: "Green Cardamom 8mm",
    price: "$18.60",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:38",
  },
  {
    id: 3,
    productName: "Fresh Coconut 550g+",
    price: "$0.42",
    unit: "piece",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:35",
  },
  {
    id: 4,
    productName: "Yellow Maize",
    price: "$286.00",
    unit: "MT",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:31",
  },
  {
    id: 5,
    productName: "Indian Red Onion",
    price: "$0.54",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:26",
  },
  {
    id: 6,
    productName: "Sona Masoori Rice",
    price: "$742.00",
    unit: "MT",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:20",
  },
  {
    id: 7,
    productName: "Red Onion, Big",
    price: "$0.38",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 8,
    productName: "Red Onion, Small",
    price: "$0.46",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 9,
    productName: "Turmeric",
    price: "$2.20",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 10,
    productName: "Dried Red Chilli",
    price: "$2.10",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 11,
    productName: "Cocopeat Block",
    price: "$220.00",
    unit: "MT",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 12,
    productName: "Black Pepper",
    price: "$6.40",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 13,
    productName: "Cardamom",
    price: "$18.60",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 14,
    productName: "Coriander Seeds",
    price: "$1.35",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 15,
    productName: "Coconut",
    price: "$0.42",
    unit: "piece",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 16,
    productName: "Rice",
    price: "$480.00",
    unit: "MT",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 17,
    productName: "Dal",
    price: "$720.00",
    unit: "MT",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 18,
    productName: "Fruits and Vegetables",
    price: "On request",
    unit: "lot",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 19,
    productName: "Tamarind",
    price: "$1.10",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 20,
    productName: "Wheat",
    price: "$280.00",
    unit: "MT",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 21,
    productName: "Lemon",
    price: "$0.55",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 22,
    productName: "Moringa Powder",
    price: "$4.80",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 23,
    productName: "Curry Leaves",
    price: "$2.90",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
  {
    id: 24,
    productName: "Groundnuts",
    price: "$1.15",
    unit: "kg",
    currency: "USD",
    updatedAt: "",
    updatedLabel: "Today, 09:40",
  },
]

type NavItem = {
  label: string
  path: string
}

export const nav: NavItem[] = [
  { label: "About", path: "/about" },
  { label: "Products", path: "/products" },
  { label: "Daily Prices", path: "/prices" },
  { label: "Reviews", path: "/reviews" },
  { label: "FAQs", path: "/faqs" },
  { label: "Contact", path: "/contact" },
]
