"use client"
import { useState } from "react"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import { EmptyState } from "@/components/ui/EmptyState"

type Folder = {
  id: string
  label: string
  icon: Parameters<typeof Icon>[0]["name"]
}

// Pastas predefinidas do sistema. Contadores ficam zerados até o backend
// de documentos genéricos (independente de Identity) existir.
const FOLDERS: Folder[] = [
  { id: "juridico", label: "Jurídico", icon: "shield" },
  { id: "financeiro", label: "Financeiro", icon: "money" },
  { id: "empresas", label: "Empresas", icon: "building" },
  { id: "pessoal", label: "Pessoal", icon: "user" },
  { id: "governo", label: "Governo", icon: "bank" },
  { id: "saude", label: "Saúde", icon: "target" },
  { id: "obras", label: "Obras", icon: "building" },
]

const FILTER_CHIPS = ["Todos", "WhatsApp", "Telegram", "E-mail", "Upload"]

export function DocsHub() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [activeChip, setActiveChip] = useState("Todos")

  return (
    <div className="flex-1 overflow-y-auto bg-bg-app">
      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Search */}
        <div className="bg-bg-surface border border-default rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex items-center gap-2.5 bg-bg-app border border-default rounded-default px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
              <Icon name="search" size={15} className="text-text-tertiary" />
              <input
                placeholder="Buscar em nome, conteúdo OCR, metadados…"
                className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary"
              />
            </div>
            <div className="flex bg-bg-surface border border-default rounded-default p-0.5">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "px-2.5 py-1.5 rounded text-small font-semibold transition-colors",
                  view === "grid"
                    ? "bg-bg-subtle text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                Grade
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "px-2.5 py-1.5 rounded text-small font-semibold transition-colors",
                  view === "list"
                    ? "bg-bg-subtle text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                Lista
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-tiny font-bold text-text-tertiary uppercase tracking-wider mr-1">
              Origem
            </span>
            {FILTER_CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setActiveChip(c)}
                className={cn(
                  "px-3 py-1 rounded-full border text-small font-medium transition-colors",
                  activeChip === c
                    ? "bg-brand-subtle text-brand border-default"
                    : "bg-bg-surface text-text-secondary border-default hover:border-strong",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Pastas */}
        <div>
          <div className="text-tiny font-bold text-text-tertiary uppercase tracking-wider mb-2.5">
            Pastas automáticas
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {FOLDERS.map((f) => (
              <div
                key={f.id}
                className="bg-bg-surface border border-default rounded-md p-3 cursor-pointer flex flex-col gap-2 hover:border-strong transition-all"
              >
                <div className="w-9 h-9 rounded-md bg-bg-subtle border border-default flex items-center justify-center text-text-secondary">
                  <Icon name={f.icon} size={14} />
                </div>
                <div className="text-body-strong text-text-primary">{f.label}</div>
                <div className="text-tiny text-text-tertiary tabular-nums">0 docs</div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state — sem documentos */}
        <div className="bg-bg-surface border border-default rounded-xl">
          <EmptyState
            icon="file"
            title="Nenhum documento ainda"
            subtitle={
              <>
                Documentos chegam pelos canais conectados (WhatsApp, Telegram, e-mail)
                e são classificados automaticamente nas pastas acima. Documentos pessoais
                (CNH, RG, passaporte) ficam em{" "}
                <a className="text-brand underline" href="/quem-sou-eu">
                  Quem Sou Eu → Identidade
                </a>
                .
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
