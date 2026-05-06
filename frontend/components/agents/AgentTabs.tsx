"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Settings, ListChecks, FileText, Webhook, MessageSquare, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/cn"

export type AgentTabKey = "geral" | "instrucoes" | "documentos" | "webhooks" | "testar"

const TABS: { key: AgentTabKey; label: string; icon: LucideIcon }[] = [
  { key: "geral",       label: "Geral",       icon: Settings     },
  { key: "instrucoes",  label: "Instruções",  icon: ListChecks   },
  { key: "documentos",  label: "Documentos",  icon: FileText     },
  { key: "webhooks",    label: "Webhooks",    icon: Webhook      },
  { key: "testar",      label: "Testar",      icon: MessageSquare },
]

export function AgentTabs({ agentId, active }: { agentId: string; active: AgentTabKey }) {
  const router = useRouter()
  const params = useSearchParams()

  function goto(key: AgentTabKey) {
    const next = new URLSearchParams(params)
    next.set("tab", key)
    router.replace(`/agentes/${agentId}?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="bg-bg-surface border-b border-default px-6 md:px-8 shrink-0">
      <div className="max-w-6xl mx-auto flex overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => goto(t.key)}
            className={cn(
              "px-4 py-3 text-body-strong font-medium tracking-tight whitespace-nowrap inline-flex items-center gap-2 border-b-2 transition-colors",
              active === t.key
                ? "text-brand border-brand"
                : "text-text-secondary border-transparent hover:text-text-primary",
            )}
          >
            <t.icon size={14} strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function tabFromParams(params: URLSearchParams): AgentTabKey {
  const t = params.get("tab")
  if (t === "instrucoes" || t === "documentos" || t === "webhooks" || t === "testar") return t
  return "geral"
}
