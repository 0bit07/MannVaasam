import { useAdminAuth } from "../../hooks/useAdminAuth"
import AdminLogin from "./AdminLogin"
import AdminPanel from "./AdminPanel"
import "./admin.css"

export default function AdminDashboard() {
  const { session, checking, login, logout } = useAdminAuth()

  if (checking) {
    return (
      <div className="admin-shell admin-centered">
        <p className="admin-empty">Checking session…</p>
      </div>
    )
  }

  if (!session) {
    return <AdminLogin onLogin={login} />
  }

  return <AdminPanel username={session.username} onLogout={logout} />
}
