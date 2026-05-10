"use client"
/**
 * Sprint H — wrapper pra páginas que só admin pode acessar.
 *
 * Se o user logado não é admin, redireciona pra raiz. Renderiza skeleton
 * enquanto está rehidratando o store (evita flash de redirecionamento
 * antes do AuthBootstrap chamar /api/auth/me).
 */
import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { useAuthStore } from "@/stores/authStore"

export function AdminOnlyPage({ children }: { children: ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isHydrating = useAuthStore((s) => s.isHydrating)

  useEffect(() => {
    if (isHydrating) return
    if (!user || user.role !== "ADMIN") {
      router.replace("/")
    }
  }, [user, isHydrating, router])

  if (isHydrating || !user) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-3 text-[12px]">
        Carregando…
      </div>
    )
  }

  if (user.role !== "ADMIN") return null
  return <>{children}</>
}
