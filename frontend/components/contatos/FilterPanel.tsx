"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

type FilterItem = {
  id: string
  label: string
  icon?: Parameters<typeof Icon>[0]["name"]
  count: number
  dotColor?: string
  sub?: FilterItem[]
}

const FILTERS: { section: string; items: FilterItem[] }[] = [
  {
    section: "",
    items: [
      { id: "all", label: "Todos", icon: "users", count: 247 },
      { id: "vip", label: "VIP", icon: "target", count: 18 },
      { id: "recent", label: "Recentes", icon: "clock", count: 42 },
      { id: "birthdays", label: "Aniversários", icon: "calendar", count: 5 },
    ],
  },
  {
    section: "Categorias",
    items: [
      { id: "familia", label: "Família", icon: "user", count: 12 },
      { id: "socios", label: "Sócios", icon: "users", count: 3 },
      {
        id: "profissionais",
        label: "Profissionais",
        icon: "card",
        count: 18,
        sub: [
          { id: "contadores", label: "Contadores", count: 2, dotColor: "var(--ok)" },
          { id: "advogados", label: "Advogados", count: 4, dotColor: "#7c3aed" },
          { id: "medicos", label: "Médicos", count: 9, dotColor: "var(--err)" },
          { id: "corretores", label: "Corretores", count: 3, dotColor: "var(--warn)" },
        ],
      },
      { id: "clientes", label: "Clientes", icon: "users", count: 42 },
      { id: "fornecedores", label: "Fornecedores", icon: "building", count: 67 },
      { id: "funcionarios", label: "Funcionários", icon: "users", count: 24 },
      { id: "governo", label: "Governo", icon: "bank", count: 7 },
    ],
  },
  {
    section: "Empresas",
    items: [
      { id: "palharestech", label: "PalharesTech", count: 35, dotColor: "var(--accent)" },
      { id: "braz", label: "Distribuidora Braz", count: 48, dotColor: "var(--ok)" },
      { id: "vimar", label: "Vimar", count: 52, dotColor: "var(--warn)" },
    ],
  },
  {
    section: "Tags",
    items: [
      { id: "vip-tag", label: "VIP", count: 18, dotColor: "var(--warn)" },
      { id: "novos", label: "Novos", count: 7, dotColor: "var(--ok)" },
      { id: "atencao", label: "Atenção", count: 3, dotColor: "var(--err)" },
    ],
  },
]

function Item({
  item,
  active,
  onClick,
  onToggle,
  expanded,
}: {
  item: FilterItem
  active: boolean
  onClick: () => void
  onToggle?: () => void
  expanded?: boolean
}) {
  return (
    <div
      onClick={() => {
        if (item.sub && onToggle) onToggle()
        else onClick()
      }}
      className={cn(
        "flex items-center gap-[9px] px-[10px] py-[7px] rounded-md cursor-pointer text-[13px] font-medium mb-px transition-colors",
        active ? "bg-accent-soft text-accent font-semibold" : "text-ink-2 hover:bg-bg"
      )}
    >
      {item.icon && <Icon name={item.icon} size={14} className={active ? "text-accent" : "text-ink-3"} />}
      {item.dotColor && (
        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: item.dotColor }} />
      )}
      <span className="flex-1 truncate">{item.label}</span>
      <span
        className={cn(
          "text-[10.5px] font-semibold px-[6px] py-px rounded-full",
          active ? "bg-white text-accent" : "bg-hair-2 text-ink-3"
        )}
      >
        {item.count}
      </span>
    </div>
  )
}

export function FilterPanel({
  active,
  onChange,
}: {
  active: string
  onChange: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>("profissionais")

  return (
    <div className="w-[240px] min-w-[240px] bg-card border-r border-hair flex flex-col overflow-hidden shrink-0">
      <div className="px-[14px] pt-[14px] pb-[10px] border-b border-hair shrink-0">
        <div className="text-[12px] font-bold text-ink-2 uppercase tracking-[.07em] mb-[10px]">
          Filtros
        </div>
        <div className="flex items-center gap-[7px] bg-bg border border-hair rounded-md px-[10px] py-[6px] focus-within:border-accent focus-within:bg-card">
          <Icon name="search" size={13} className="text-ink-3" />
          <input
            placeholder="Buscar filtro..."
            className="flex-1 bg-transparent outline-none text-[12.5px] text-ink placeholder:text-ink-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-[14px]">
        {FILTERS.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <div className="mt-[14px] mb-[6px] px-2 text-[10px] font-bold text-ink-3 uppercase tracking-[.07em] flex justify-between items-center">
                <span>{group.section}</span>
                <button className="w-[18px] h-[18px] rounded border border-hair bg-card text-ink-2 hover:border-accent hover:text-accent flex items-center justify-center transition-colors">
                  <Icon name="plus" size={11} />
                </button>
              </div>
            )}
            {group.items.map((item) => (
              <div key={item.id}>
                <Item
                  item={item}
                  active={active === item.id}
                  onClick={() => onChange(item.id)}
                  onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                  expanded={expanded === item.id}
                />
                {item.sub && expanded === item.id && (
                  <div className="pl-2 ml-[18px] my-1 border-l border-hair">
                    {item.sub.map((s) => (
                      <Item
                        key={s.id}
                        item={s}
                        active={active === s.id}
                        onClick={() => onChange(s.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
