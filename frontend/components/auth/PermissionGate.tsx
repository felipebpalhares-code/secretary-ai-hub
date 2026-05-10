"use client"
/**
 * Sprint H — esconde children se o user logado não tiver a permissão.
 *
 * Apenas UX. Backend valida de novo via require_permission. Não use isso
 * pra esconder dados sensíveis — só esconde elementos de UI (botões etc).
 */
import type { ReactNode } from "react"

import { useAuthStore } from "@/stores/authStore"

export function PermissionGate({
  module,
  action,
  fallback = null,
  children,
}: {
  module: string
  action: string
  fallback?: ReactNode
  children: ReactNode
}) {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  if (!hasPermission(module, action)) return <>{fallback}</>
  return <>{children}</>
}

export function AdminOnly({
  fallback = null,
  children,
}: {
  fallback?: ReactNode
  children: ReactNode
}) {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  if (!isAdmin()) return <>{fallback}</>
  return <>{children}</>
}
