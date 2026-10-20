import { useEffect, useRef, useState } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import SplashScreen from "./components/SplashScreen"
import About from "./pages/About"
import AdminDashboard from "./pages/admin/AdminDashboard"
import Enquiry from "./pages/Enquiry"
import Faqs from "./pages/Faqs"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Prices from "./pages/Prices"
import ProductDetails from "./pages/ProductDetails"
import Products from "./pages/Products"
import Reviews from "./pages/Reviews"
import { matchRoute, pageTitle, toHref, type AppRoute } from "./routes"
import type { Go } from "./types"

function renderPage(route: AppRoute, go: Go) {
  switch (route.id) {
    case "home":
      return <Home go={go} />
    case "about":
      return <About go={go} />
    case "products":
      return <Products go={go} />
    case "product":
      return <ProductDetails slug={route.slug} go={go} />
    case "prices":
      return <Prices />
    case "enquiry":
      return <Enquiry />
    case "reviews":
      return <Reviews go={go} />
    case "faqs":
      return <Faqs go={go} />
    case "contact":
      return <Enquiry contact />
    default:
      return <NotFound go={go} />
  }
}

const SPLASH_LEAVE_AFTER_MS = 1600
const SPLASH_HIDE_AFTER_MS = 2000

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    matchRoute(window.location.pathname),
  )
  const [splash, setSplash] = useState({ show: true, leaving: false })
  const splashTimers = useRef<number[]>([])

  const go: Go = (path) => {
    window.history.pushState(null, "", toHref(path))
    setRoute(matchRoute(window.location.pathname))
  }

  // Shows the full-screen company-logo splash for ~2s, optionally running a
  // callback (e.g. navigating home) just before it fades out. Used both on
  // first load and whenever the header brand/logo is clicked.
  function runSplash(duringFade?: () => void) {
    splashTimers.current.forEach((timer) => window.clearTimeout(timer))
    splashTimers.current = [
      window.setTimeout(() => {
        duringFade?.()
        setSplash({ show: true, leaving: true })
      }, SPLASH_LEAVE_AFTER_MS),
      window.setTimeout(
        () => setSplash({ show: false, leaving: false }),
        SPLASH_HIDE_AFTER_MS,
      ),
    ]
    setSplash({ show: true, leaving: false })
  }

  useEffect(() => {
    runSplash()
    return () =>
      splashTimers.current.forEach((timer) => window.clearTimeout(timer))
    // Runs once, on the very first app load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleBrandClick() {
    if (splash.show) return
    runSplash(() => go("/"))
  }

  useEffect(() => {
    if (!window.location.hash.startsWith("#/")) return
    const next = window.location.hash.slice(1)
    window.history.replaceState(
      null,
      "",
      toHref(next.startsWith("/") ? next : `/${next}`),
    )
    setRoute(matchRoute(window.location.pathname))
  }, [])

  useEffect(() => {
    const onPop = () => setRoute(matchRoute(window.location.pathname))
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  useEffect(() => {
    // Product pages set their own, more specific title once the product loads.
    if (route.id !== "product") {
      document.title = pageTitle(route)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) =>
            entry.isIntersecting && entry.target.classList.add("visible"),
        )
      },
      { threshold: 0.12 },
    )

    const pageEl = document.querySelector(".page")
    pageEl
      ?.querySelectorAll(".reveal")
      .forEach((node) => observer.observe(node))

    // Content that loads asynchronously (e.g. products from the API) renders
    // its ".reveal" elements after this effect already ran its initial scan.
    // Watch for those nodes being added so they get observed too, instead of
    // staying permanently hidden.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches(".reveal")) observer.observe(node)
          node
            .querySelectorAll(".reveal")
            .forEach((child) => observer.observe(child))
        })
      }
    })
    if (pageEl) {
      mutationObserver.observe(pageEl, { childList: true, subtree: true })
    }

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [route])

  if (route.id === "admin") {
    return <AdminDashboard />
  }

  return (
    <div className="app">
      {splash.show && <SplashScreen leaving={splash.leaving} />}
      <Header path={route.path} go={go} onBrandClick={handleBrandClick} />
      <div className="page" key={route.path}>
        {renderPage(route, go)}
      </div>
      <Footer go={go} />
    </div>
  )
}
