export type PageId = "home" | "about" | "products" | "product" | "prices" | "enquiry" | "reviews" | "faqs" | "contact" | "admin" | "not-found"

export type AppRoute = {
  id: PageId
  slug?: string
  path: string
}

const staticRoutes: Record<string, PageId> = {
  "/": "home",
  "/about": "about",
  "/products": "products",
  "/prices": "prices",
  "/enquiry": "enquiry",
  "/reviews": "reviews",
  "/faqs": "faqs",
  "/contact": "contact",
  "/admin-dashboard": "admin",
}

export function normalizePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  let path = pathname
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || "/"
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1)
  return path || "/"
}

export function toHref(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  const normalized = path.startsWith("/") ? path : `/${path}`
  return base ? `${base}${normalized}` : normalized
}

export function matchRoute(pathname: string): AppRoute {
  const path = normalizePath(pathname)
  const productMatch = path.match(/^\/products\/([^/]+)$/)
  if (productMatch) {
    return {
      id: "product",
      slug: decodeURIComponent(productMatch[1]),
      path,
    }
  }
  const id = staticRoutes[path]
  if (id) return { id, path }
  return { id: "not-found", path }
}

export function pageTitle(route: AppRoute, productName?: string): string {
  const brand = "Mannvaasam Global Exim"
  switch (route.id) {
    case "home":
      return brand
    case "about":
      return `About · ${brand}`
    case "products":
      return `Products · ${brand}`
    case "product":
      return productName ? `${productName} · ${brand}` : `Product · ${brand}`
    case "prices":
      return `Daily Prices · ${brand}`
    case "enquiry":
      return `Enquiry · ${brand}`
    case "reviews":
      return `Reviews · ${brand}`
    case "faqs":
      return `FAQs · ${brand}`
    case "contact":
      return `Contact · ${brand}`
    case "admin":
      return `Admin · ${brand}`
    default:
      return `Page not found · ${brand}`
  }
}
