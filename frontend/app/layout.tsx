import type { Metadata } from "next"
import "./globals.css"
import { LayoutShell } from "@/components/auth/LayoutShell"
import { AuthBootstrap } from "@/components/auth/AuthBootstrap"

export const metadata: Metadata = {
  title: "Felipe Hub",
  description: "Secretário pessoal multi-agente",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-ink text-[13.5px] h-screen flex overflow-hidden">
        <AuthBootstrap />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
