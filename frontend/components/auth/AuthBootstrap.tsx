"use client"
/**
 * Sprint H — rehidrata o authStore na primeira renderização do app.
 *
 * Como o cookie é httpOnly, o JS não enxerga ele direto. A única forma de
 * descobrir quem está logado em refresh é chamar /api/auth/me e popular
 * o store. Se a chamada falhar com 401, o middleware já redirecionou pra
 * /login antes de chegar aqui — basta limpar o store.
 */
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { authApi } from "@/lib/auth-api"
import { ApiError } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"

export function AuthBootstrap() {
  const router = useRouter()
  const pathname = usePathname()
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  useEffect(() => {
    let mounted = true
    authApi
      .me()
      .then((u) => {
        if (mounted) setUser(u)
      })
      .catch((err) => {
        if (!mounted) return
        clearUser()
        if (err instanceof ApiError && err.status === 401 && pathname !== "/login") {
          router.replace("/login")
        }
      })
    return () => {
      mounted = false
    }
    // Reroda apenas em mudança explícita de path; me() é idempotente e barato.
  }, [pathname, setUser, clearUser, router])

  return null
}
