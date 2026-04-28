"use client"
import { useState } from "react"
import { Icon } from "@/components/Icon"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn } from "@/lib/cn"

const SECTIONS = [
  { id: "familia", label: "Família" },
  { id: "socios", label: "Sócios" },
  { id: "profissionais", label: "Profissionais de confiança" },
  { id: "negocios", label: "Negócios" },
] as const

const FILTER_CHIPS = [
  { id: "todos", label: "Todos" },
  { id: "30d", label: "Últimos 30d" },
  { id: "wa", label: "Com WhatsApp" },
  { id: "email", label: "Com e-mail" },
  { id: "empresa", label: "Com empresa" },
]

export function ContatosHub() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [activeChip, setActiveChip] = useState("todos")

  return (
    <div className="flex-1 flex overflow-hidden min-w-0 bg-bg-app">
      {/* Sidebar de filtros (estrutura preservada, contadores zerados) */}
      <aside className="w-[262px] min-w-[262px] bg-bg-surface border-r border-default p-4 overflow-y-auto shrink-0">
        <div className="text-tiny uppercase tracking-wider text-text-tertiary font-medium px-2 mb-2">
          Categorias
        </div>
        {SECTIONS.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between px-3 py-2 rounded-default text-body text-text-secondary hover:bg-bg-subtle cursor-pointer transition-colors"
          >
            <span>{s.label}</span>
            <span className="text-tiny text-text-tertiary tabular-nums">0</span>
          </div>
        ))}
        <div className="text-tiny uppercase tracking-wider text-text-tertiary font-medium px-2 mt-6 mb-2">
          Integrações
        </div>
        <div className="px-3 py-2 text-small text-text-tertiary leading-relaxed">
          Importação do Google Contacts virá numa próxima entrega.
        </div>
      </aside>

      {/* Center */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-w-0 px-6 py-5">
        {/* Search row */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2.5 bg-bg-surface border border-default rounded-default px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
            <Icon name="search" size={15} className="text-text-tertiary" />
            <input
              placeholder="Buscar por nome, empresa, telefone, e-mail…"
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
                  : "text-text-tertiary hover:text-text-secondary"
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
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              Lista
            </button>
          </div>
        </div>

        {/* Chips */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {FILTER_CHIPS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChip(c.id)}
              className={cn(
                "px-3 py-1 rounded-full border text-small font-medium transition-colors",
                activeChip === c.id
                  ? "bg-brand-subtle text-brand border-default"
                  : "bg-bg-surface text-text-secondary border-default hover:border-strong"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex-1 bg-bg-surface border border-default rounded-xl mt-2">
          <EmptyState
            icon="users"
            title="Nenhum contato cadastrado"
            subtitle={
              <>
                Quando você adicionar contatos (família, sócios, profissionais de confiança,
                clientes), eles aparecem aqui agrupados por categoria. Importação do
                Google Contacts será disponibilizada em uma próxima entrega.
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
