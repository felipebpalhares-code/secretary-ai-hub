import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/Sidebar"

export const metadata: Metadata = {
  title: "Felipe Hub",
  description: "Secretário pessoal multi-agente",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-ink text-[13.5px] h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</main>
      </body>
    </html>
  )
}
