import { useCallback, useEffect, useState } from "react"
import { apiFetch } from "../lib/api"

type AdminSession = { username: string } | null

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession>(null)
  const [checking, setChecking] = useState(true)

  const refresh = useCallback(async () => {
    setChecking(true)
    try {
      const data = await apiFetch<{ username: string }>("/api/auth/me")
      setSession(data)
    } catch {
      setSession(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiFetch<{ username: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    setSession(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" })
    } finally {
      setSession(null)
    }
  }, [])

  return { session, checking, login, logout }
}
