import { Mark } from "./ui"

export default function SplashScreen({ leaving }: { leaving: boolean }) {
  return (
    <div
      className={`splash-screen${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="Loading Mannvaasam Global Exim"
    >
      <Mark />
      <span className="brand-name">MANNVAASAM</span>
      <span className="brand-sub">GLOBAL EXIM</span>
    </div>
  )
}
