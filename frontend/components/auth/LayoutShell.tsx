"use client"
/**
 * Sprint H — wrapper que decide se mostra a Sidebar.
 *
 * Em /login (e qualquer outra rota fora do app autenticado), a Sidebar
 * fica oculta. Pra todas as demais, mantém o layout com Sidebar.
 */
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"

const FULLSCREEN_ROUTES = ["/login"]

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const fullscreen = FULLSCREEN_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  if (fullscreen) {
    return <main className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</main>
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</main>
    </>
  )
}
