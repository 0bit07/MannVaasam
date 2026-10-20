export type Go = (path: string) => void

export type ProductSpec = {
  label: string
  value: string
}

export type Review = {
  id: string
  name: string
  company: string
  rating: number
  comment: string
  date: string
}

export type Faq = {
  id: string
  question: string
  answer: string
}

export type Product = {
  slug: string
  name: string
  category: string
  origin: string
  price: string
  unit: string
  grade: string
  image: string
  alt: string
  description: string
  secondaryImage?: string
  secondaryAlt?: string
  specs?: ProductSpec[]
  noteLead?: string
  noteEmphasis?: string
  note?: string
}

export type ProductInput = {
  name: string
  category: string
  origin: string
  price: string
  unit: string
  grade: string
  image: string
  alt: string
  description: string
}

export type EnquiryType = "buy" | "sell" | "contact"

export type EnquiryStatus = "todo" | "completed"

export type Enquiry = {
  id: number
  type: EnquiryType
  name: string
  company: string
  email: string
  phone: string
  product: string
  volume: string
  message: string
  status: EnquiryStatus
  createdAt: string
}

export type DailyPrice = {
  id: number
  productName: string
  price: string
  unit: string
  currency: string
  updatedAt: string
  updatedLabel: string
}

export type NewEnquiry = {
  type: EnquiryType
  name: string
  company: string
  email: string
  phone: string
  product: string
  volume: string
  message: string
}

export type AdminUser = {
  username: string
  createdAt: string
}
