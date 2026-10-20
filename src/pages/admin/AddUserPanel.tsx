import { FormEvent, useState } from "react"
import { ErrorState, Loader } from "../../components/ui"
import { apiFetch } from "../../lib/api"
import {
  describeApiError,
  useApiQuery,
  useApiMutation,
} from "../../lib/apiResource"
import type { AdminUser } from "../../types"

type NewAdminUser = {
  username: string
  password: string
}

export default function AddUserPanel() {
  const {
    data: users,
    loading,
    error: listError,
    reload,
  } = useApiQuery<AdminUser[]>("/api/users", {
    initialData: [],
    fallbackMessage: "Could not load users.",
  })

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState("")

  const createUser = useApiMutation(
    (payload: NewAdminUser) =>
      apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    { fallback: "Could not create the user." },
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setSuccess("")
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }
    try {
      await createUser.run({ username, password })
      setSuccess(`User "${username}" can now sign in to the admin dashboard.`)
      setUsername("")
      setPassword("")
      setConfirmPassword("")
      reload()
    } catch (err) {
      setFormError(
        describeApiError(err, { fallback: "Could not create the user." }),
      )
    }
  }

  return (
    <>
      <h2>Admin users</h2>
      <p className="admin-column-sub">
        Add a new username and password that can log in here.
      </p>
      <form className="admin-form" onSubmit={submit}>
        <label>
          Username
          <input
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="e.g. priya"
            autoComplete="off"
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm password
          <input
            required
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>
        {formError && <p className="admin-error">{formError}</p>}
        {success && <p className="admin-success">{success}</p>}
        <button
          className="admin-submit"
          type="submit"
          disabled={createUser.loading}
        >
          {createUser.loading ? "Creating…" : "Create user"}
        </button>
      </form>

      <p className="admin-column-sub">Existing admin users</p>
      {loading && <Loader label="Loading users…" />}
      {!loading && listError && (
        <ErrorState message={listError} onRetry={reload} />
      )}
      {!loading && !listError && (
        <div className="admin-list">
          {users.map((user) => (
            <article className="admin-card" key={user.username}>
              <strong>{user.username}</strong>
              <span>Added {new Date(user.createdAt).toLocaleDateString()}</span>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
