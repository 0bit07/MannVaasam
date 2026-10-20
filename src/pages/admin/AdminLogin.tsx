import { FormEvent, useState } from "react"
import { Mark } from "../../components/ui"
import { ApiError } from "../../lib/api"

type AdminLoginProps = {
  onLogin: (username: string, password: string) => Promise<{ username: string }>
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await onLogin(username, password)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not sign in. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-shell admin-centered">
      <div className="admin-login-card">
        <Mark />
        <h1>Admin sign in</h1>
        <p>
          Enter your admin username and password to manage the Mannvaasam
          portal.
        </p>
        <form onSubmit={submit}>
          <label>
            Username
            <input
              required
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
