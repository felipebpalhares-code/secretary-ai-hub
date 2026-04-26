"use client"
import { useState, useMemo } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import {
  TRANSACTIONS,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  AGENT_INFO_TX,
  type Transaction,
  type TxCategory,
} from "@/lib/transactions-data"
import { ENTITIES, BANK_COLORS, fmtBRL, type Entity } from "@/lib/banks-data"

type FlowFilter = "all" | "in" | "out"

export function Extrato() {
  const [search, setSearch] = useState("")
  const [flow, setFlow] = useState<FlowFilter>("all")
  const [entity, setEntity] = useState<"all" | Entity>("all")
  const [category, setCategory] = useState<"all" | TxCategory>("all")

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      if (flow === "in" && t.amount < 0) return false
      if (flow === "out" && t.amount > 0) return false
      if (entity !== "all" && t.entity !== entity) return false
      if (category !== "all" && t.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.desc.toLowerCase().includes(q) && !t.meta?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [search, flow, entity, category])

  const stats = useMemo(() => {
    const ins = filtered.filter((t) => t.amount > 0)
    const outs = filtered.filter((t) => t.amount < 0)
    return {
      entrada: ins.reduce((s, t) => s + t.amount, 0),
      saida: outs.reduce((s, t) => s + t.amount, 0),
      total: filtered.length,
      categorized: filtered.filter((t) => t.agent).length,
    }
  }, [filtered])

  // group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    filtered.forEach((t) => {
      const arr = map.get(t.date) ?? []
      arr.push(t)
      map.set(t.date, arr)
    })
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <StatTile
          icon="check"
          variant="ok"
          label="Entrada"
          value={fmtBRL(stats.entrada)}
          meta={`${filtered.filter((t) => t.amount > 0).length} transações`}
        />
        <StatTile
          icon="send"
          variant="err"
          label="Saída"
          value={fmtBRL(Math.abs(stats.saida))}
          meta={`${filtered.filter((t) => t.amount < 0).length} transações`}
        />
        <StatTile
          icon="chart"
          variant="ink"
          label="Saldo do filtro"
          value={fmtBRL(stats.entrada + stats.saida)}
          meta={`${stats.total} transações totais`}
        />
        <StatTile
          icon="bot"
          variant="indigo"
          label="Categorizadas"
          value={`${stats.categorized}/${stats.total}`}
          meta="pelo Ricardo + agentes"
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-hair rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-[10px] bg-bg border border-hair rounded-md px-[14px] py-[9px] focus-within:border-accent focus-within:bg-card transition-all">
            <Icon name="search" size={15} className="text-ink-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar descrição, NF, fornecedor..."
              className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-ink-3"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-ink-3 hover:text-ink">
                <Icon name="close" size={13} />
              </button>
            )}
          </div>
          <button className="px-[13px] py-[9px] rounded-md border border-hair bg-card text-[12.5px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors flex items-center gap-1">
            <Icon name="calendar" size={13} />
            Abril 2026
          </button>
          <button className="px-[13px] py-[9px] rounded-md border border-hair bg-card text-[12.5px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors flex items-center gap-1">
            <Icon name="send" size={13} />
            Exportar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterGroup label="Fluxo">
            <Chip active={flow === "all"} onClick={() => setFlow("all")}>
              Todas
            </Chip>
            <Chip active={flow === "in"} onClick={() => setFlow("in")}>
              <span className="text-ok">●</span> Entradas
            </Chip>
            <Chip active={flow === "out"} onClick={() => setFlow("out")}>
              <span className="text-err">●</span> Saídas
            </Chip>
          </FilterGroup>
          <FilterGroup label="Entidade">
            <Chip active={entity === "all"} onClick={() => setEntity("all")}>
              Todas
            </Chip>
            {ENTITIES.map((e) => (
              <Chip key={e.id} active={entity === e.id} onClick={() => setEntity(e.id)}>
                {e.short}
              </Chip>
            ))}
          </FilterGroup>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] mr-2">
            Categoria
          </span>
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            Todas
          </Chip>
          {(
            ["receita-vendas", "material-obra", "mao-de-obra", "fornecedor", "alimentacao", "educacao", "imposto", "consorcio"] as TxCategory[]
          ).map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-card border border-hair rounded-lg overflow-hidden">
        {grouped.length === 0 && (
          <div className="px-6 py-12 text-center text-ink-3 text-[13px] font-medium">
            Nenhuma transação corresponde aos filtros
          </div>
        )}
        {grouped.map(([date, txs]) => (
          <div key={date}>
            <div className="px-4 py-2 bg-bg border-b border-hair-2 text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] sticky top-0 z-10">
              {fmtDateHeader(date)} · {txs.length} {txs.length === 1 ? "transação" : "transações"}
            </div>
            {txs.map((t, i) => (
              <TxRow key={t.id} t={t} last={i === txs.length - 1} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function TxRow({ t, last }: { t: Transaction; last: boolean }) {
  const isIn = t.amount > 0
  return (
    <div
      className={cn(
        "grid grid-cols-[36px_1fr_140px_160px_160px] items-center gap-3 px-4 py-3 hover:bg-bg cursor-pointer transition-colors",
        !last && "border-b border-hair-2"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-md flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0",
          BANK_COLORS[t.bank]
        )}
      >
        {t.bankLabel.slice(0, 3)}
      </div>

      <div className="min-w-0">
        <div className="text-[13px] font-bold text-ink tracking-[-.15px] truncate">{t.desc}</div>
        <div className="text-[11px] text-ink-3 font-medium mt-px flex items-center gap-2">
          <span className="mono">{t.bankLabel} · {t.accountSuffix}</span>
          {t.conciliated && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-[6px] py-px rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Icon name="check" size={9} />
              Conciliada
            </span>
          )}
          {t.meta && <span className="text-ink-3">· {t.meta}</span>}
        </div>
      </div>

      <div>
        <span
          className={cn(
            "inline-flex items-center text-[10.5px] font-semibold px-[8px] py-[2px] rounded border",
            CATEGORY_COLOR[t.category]
          )}
        >
          {CATEGORY_LABEL[t.category]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {t.agent && (
          <span className="inline-flex items-center gap-[5px] text-[10.5px] font-semibold text-ink-2 bg-bg border border-hair px-[8px] py-[3px] rounded">
            <span className="text-[11px]">{AGENT_INFO_TX[t.agent].emoji}</span>
            {AGENT_INFO_TX[t.agent].label}
          </span>
        )}
      </div>

      <div className="text-right">
        <div
          className={cn(
            "text-[14px] font-bold mono tabular tracking-[-.2px]",
            isIn ? "text-ok" : "text-ink"
          )}
        >
          {isIn ? "+" : ""}
          {fmtBRL(t.amount)}
        </div>
      </div>
    </div>
  )
}

function StatTile({
  icon,
  variant,
  label,
  value,
  meta,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  variant: "ok" | "err" | "ink" | "indigo"
  label: string
  value: string
  meta: string
}) {
  const cls = {
    ok: "border-l-ok",
    err: "border-l-err",
    ink: "border-l-ink-4",
    indigo: "border-l-accent",
  }[variant]
  const iconBg = {
    ok: "bg-emerald-50 text-ok border-emerald-200",
    err: "bg-red-50 text-err border-red-200",
    ink: "bg-bg text-ink-2 border-hair",
    indigo: "bg-accent-soft text-accent border-indigo-200",
  }[variant]
  return (
    <div className={cn("bg-card border border-hair border-l-[3px] rounded-md p-4", cls)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-7 h-7 rounded-md border flex items-center justify-center", iconBg)}>
          <Icon name={icon} size={13} />
        </div>
        <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">{label}</span>
      </div>
      <div className="text-[18px] font-bold text-ink mono tabular tracking-[-.3px]">{value}</div>
      <div className="text-[10.5px] text-ink-3 font-medium mt-1">{meta}</div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] mr-2">{label}</span>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-[10px] py-[3px] rounded-full border text-[11px] font-semibold transition-colors flex items-center gap-1",
        active
          ? "bg-accent-soft border-indigo-200 text-accent"
          : "bg-card border-hair text-ink-2 hover:border-ink-4"
      )}
    >
      {children}
    </button>
  )
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

function fmtDateHeader(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  const day = String(d).padStart(2, "0")
  const today = new Date()
  const isToday = today.toDateString() === date.toDateString()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const isYesterday = yesterday.toDateString() === date.toDateString()
  const prefix = isToday ? "Hoje · " : isYesterday ? "Ontem · " : ""
  return `${prefix}${WEEKDAYS[date.getDay()]}, ${day}/${MONTHS[m - 1]}`
}
