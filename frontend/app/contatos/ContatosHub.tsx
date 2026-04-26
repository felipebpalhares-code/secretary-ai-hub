"use client"
import { useState } from "react"
import { Icon } from "@/components/Icon"
import { FilterPanel } from "@/components/contatos/FilterPanel"
import { ContactCard } from "@/components/contatos/ContactCard"
import { ContactDetail } from "@/components/contatos/ContactDetail"
import { CONTACTS, type Contact } from "@/lib/contacts-data"
import { cn } from "@/lib/cn"

const SECTIONS: { id: Contact["category"]; label: string; total: number }[] = [
  { id: "familia", label: "Família", total: 12 },
  { id: "socios", label: "Sócios", total: 3 },
  { id: "profissionais", label: "Profissionais de confiança", total: 18 },
  { id: "negocios", label: "Negócios", total: 109 },
]

export function ContatosHub() {
  const [filter, setFilter] = useState("all")
  const [selected, setSelected] = useState<string>("ana")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [chips, setChips] = useState<Record<string, boolean>>({ todos: true })

  const toggleChip = (id: string) =>
    setChips((c) => ({ ...c, [id]: !c[id] }))

  return (
    <div className="flex-1 flex overflow-hidden min-w-0">
      <FilterPanel active={filter} onChange={setFilter} />

      {/* Center */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-w-0 px-6 py-[18px]">
        {/* Search row */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-[10px] bg-card border border-hair rounded-md px-[14px] py-[9px] focus-within:border-accent focus-within:ring-2 focus-within:ring-indigo-600/10 transition-all">
            <Icon name="search" size={15} className="text-ink-3" />
            <input
              placeholder="Buscar por nome, empresa, telefone, email..."
              className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-ink-3"
            />
            <span className="text-[10px] text-ink-3 bg-bg border border-hair px-[6px] py-px rounded font-semibold">
              ⌘K
            </span>
          </div>
          <div className="flex gap-0 bg-card border border-hair rounded-md p-[2px]">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "px-[10px] py-[6px] rounded text-[12px] font-semibold transition-colors",
                view === "grid" ? "bg-bg text-ink" : "text-ink-3"
              )}
            >
              Grade
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-[10px] py-[6px] rounded text-[12px] font-semibold transition-colors",
                view === "list" ? "bg-bg text-ink" : "text-ink-3"
              )}
            >
              Lista
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-[6px] flex-wrap items-center">
          <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] mr-1">
            Filtros
          </span>
          {[
            { id: "todos", label: "Todos" },
            { id: "30d", label: "Últimos 30d" },
            { id: "wa", label: "Com WhatsApp" },
            { id: "email", label: "Com e-mail" },
            { id: "empresa", label: "Com empresa" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => toggleChip(c.id)}
              className={cn(
                "px-[11px] py-[4px] rounded-full border text-[12px] font-semibold tracking-[-.05px] transition-colors",
                chips[c.id]
                  ? "bg-accent-soft border-indigo-200 text-accent"
                  : "bg-card border-hair text-ink-2 hover:border-ink-4"
              )}
            >
              {c.label}
              {chips[c.id] && <span className="ml-1 text-[13px] opacity-70">×</span>}
            </button>
          ))}
        </div>

        {/* Birthdays notice */}
        <div className="bg-card border border-hair rounded-lg px-[18px] py-[14px] flex gap-[14px] items-center">
          <div className="w-9 h-9 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-ink tracking-[-.15px]">
              5 aniversários em 15 dias
            </div>
            <div className="text-[11.5px] text-ink-2 mt-0.5 font-medium">
              Ana (agente) cuida dos presentes e lembretes automáticos
            </div>
          </div>
          <div className="flex gap-[6px]">
            <PillChip initials="A" bg="slate" label="Ana · amanhã" />
            <PillChip initials="J" bg="emerald" label="José · 3d" />
            <PillChip initials="M" bg="indigo" label="Mateus · 15d" />
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((sec) => {
          const items = CONTACTS.filter((c) => c.category === sec.id)
          if (!items.length) return null
          return (
            <div key={sec.id}>
              <div className="flex items-center justify-between mb-[10px] px-[2px]">
                <div className="text-[13.5px] font-bold text-ink tracking-[-.25px] flex items-center gap-2">
                  {sec.label}
                  <span className="text-[11px] text-ink-3 font-semibold px-[7px] py-px rounded-full bg-hair-2">
                    {items.length} de {sec.total}
                  </span>
                </div>
                <button className="text-[11.5px] font-semibold text-accent cursor-pointer bg-transparent border-none inline-flex items-center gap-[3px] tracking-[-.1px] hover:text-accent-hover">
                  Ver todos →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((c) => (
                  <ContactCard
                    key={c.id}
                    contact={c}
                    selected={selected === c.id}
                    onClick={() => setSelected(c.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <ContactDetail contact={CONTACTS.find((c) => c.id === selected)} />
    </div>
  )
}

function PillChip({ initials, bg, label }: { initials: string; bg: "slate" | "emerald" | "indigo"; label: string }) {
  const cls = bg === "slate" ? "bg-slate-700" : bg === "emerald" ? "bg-emerald-600" : "bg-accent"
  return (
    <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] pl-[4px] rounded-full bg-bg border border-hair text-[11.5px] font-semibold text-ink tracking-[-.1px]">
      <span className={cn("w-[22px] h-[22px] rounded-full text-white text-[10px] font-bold flex items-center justify-center", cls)}>
        {initials}
      </span>
      {label}
    </span>
  )
}
