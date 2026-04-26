"use client"
import { useState, useMemo } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import {
  CARDS,
  BRAND_LABEL,
  fmtBRL2,
  daysUntilDue,
  type CreditCard,
} from "@/lib/cards-data"
import { ENTITIES, fmtBRL } from "@/lib/banks-data"

const BANK_GRADIENT = {
  itau: "from-orange-500 to-orange-700",
  nubank: "from-purple-600 to-purple-900",
  bradesco: "from-red-600 to-red-900",
  bb: "from-yellow-500 to-yellow-700",
  santander: "from-red-500 to-red-700",
  inter: "from-orange-600 to-orange-800",
} as const

export function CreditCards() {
  const [selectedId, setSelectedId] = useState<string>(CARDS[0].id)
  const selected = CARDS.find((c) => c.id === selectedId)!

  const stats = useMemo(() => {
    const total = CARDS.reduce((s, c) => s + c.limit, 0)
    const used = CARDS.reduce((s, c) => s + c.used, 0)
    const dueThisMonth = CARDS.reduce((s, c) => s + c.used, 0)
    const available = total - used
    return { total, used, dueThisMonth, available }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Stat
          icon="card"
          variant="indigo"
          label="Limite total"
          value={fmtBRL(stats.total)}
          meta={`${CARDS.length} cartões ativos`}
        />
        <Stat
          icon="chart"
          variant="amber"
          label="Limite usado"
          value={fmtBRL(stats.used)}
          meta={`${((stats.used / stats.total) * 100).toFixed(0)}% utilizado`}
        />
        <Stat
          icon="check"
          variant="ok"
          label="Limite disponível"
          value={fmtBRL(stats.available)}
          meta="Para novas compras"
        />
        <Stat
          icon="clock"
          variant="err"
          label="Faturas em aberto"
          value={fmtBRL(stats.dueThisMonth)}
          meta="A pagar nos próximos 30 dias"
        />
      </div>

      {/* Cards grid */}
      <div>
        <div className="flex items-center justify-between mb-[10px]">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
            Seus cartões
          </div>
          <button className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent bg-accent-soft border border-indigo-200 px-[11px] py-[5px] rounded-md hover:bg-indigo-100 transition-colors">
            <Icon name="plus" size={11} />
            Adicionar cartão
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CARDS.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              selected={selectedId === card.id}
              onClick={() => setSelectedId(card.id)}
            />
          ))}
        </div>
      </div>

      {/* Selected card invoice */}
      <InvoicePanel card={selected} />
    </div>
  )
}

function CardItem({
  card,
  selected,
  onClick,
}: {
  card: CreditCard
  selected: boolean
  onClick: () => void
}) {
  const pct = (card.used / card.limit) * 100
  const days = daysUntilDue(card.dueDay)
  const entity = ENTITIES.find((e) => e.id === card.entity)!

  const barCls = pct >= 90 ? "bg-err" : pct >= 70 ? "bg-warn" : "bg-ok"
  const dueCls = days <= 5 ? "text-err" : days <= 10 ? "text-warn" : "text-ink-2"

  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg overflow-hidden text-left transition-all",
        selected
          ? "border-accent ring-2 ring-indigo-600/15"
          : "border-hair hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)]"
      )}
    >
      {/* Visual card mockup */}
      <div
        className={cn(
          "bg-gradient-to-br p-4 text-white relative overflow-hidden",
          BANK_GRADIENT[card.bank]
        )}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider opacity-90">
              {card.bankLabel}
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">{card.tier}</div>
          </div>
          <div className="text-[11px] font-bold opacity-80 italic">{BRAND_LABEL[card.brand]}</div>
        </div>
        <div className="font-mono text-[14px] tracking-[.15em] mb-3">●●●● {card.last4}</div>
        <div className="flex items-end justify-between text-[10px] opacity-80">
          <div>
            <div className="opacity-60 text-[9px] uppercase tracking-wider mb-px">Titular</div>
            <div className="font-semibold tracking-wide">{card.holder}</div>
          </div>
          <div>
            <div className="opacity-60 text-[9px] uppercase tracking-wider mb-px">Validade</div>
            <div className="font-semibold mono">{card.expiry}</div>
          </div>
        </div>
        {card.primary && (
          <div className="absolute top-3 right-3 text-[9px] font-bold bg-white/20 backdrop-blur px-[6px] py-px rounded uppercase tracking-wider">
            Principal
          </div>
        )}
      </div>

      {/* Stats below */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-bold px-[7px] py-[2px] rounded border tracking-[.02em]",
              card.entity === "pf"
                ? "bg-accent-soft text-accent border-indigo-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            )}
          >
            {entity.short}
          </span>
          {card.international && (
            <span className="text-[10px] font-bold text-ink-3 bg-bg border border-hair px-[7px] py-[2px] rounded">
              Internacional
            </span>
          )}
          <span className={cn("ml-auto text-[11px] font-bold", dueCls)}>
            {days === 0 ? "Vence hoje" : days === 1 ? "Vence amanhã" : `Vence em ${days}d`}
          </span>
        </div>

        <div>
          <div className="flex justify-between mb-1 text-[10.5px] text-ink-3 font-medium">
            <span>
              <span className="text-ink font-bold mono">{fmtBRL(card.used)}</span> de{" "}
              {fmtBRL(card.limit)}
            </span>
            <span className="font-bold">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-hair rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", barCls)} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10.5px] text-ink-3 font-medium pt-1 border-t border-hair-2">
          <span>
            Fecha dia <strong className="text-ink">{card.closeDay}</strong>
          </span>
          <span>
            Vence dia <strong className="text-ink">{card.dueDay}</strong>
          </span>
          <span>
            <strong className="text-ink">{card.charges.length}</strong> compras
          </span>
        </div>
      </div>
    </button>
  )
}

function InvoicePanel({ card }: { card: CreditCard }) {
  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-hair">
        <div className="text-[14px] font-bold text-ink tracking-[-.2px]">
          Fatura aberta · {card.bankLabel} {card.tier} ●●●● {card.last4}
        </div>
        <span className="text-[11px] text-ink-3 font-medium">
          Fecha dia {card.closeDay} · Vence dia {card.dueDay}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10.5px] text-ink-3 font-medium">Total parcial</span>
          <span className="text-[18px] font-bold text-ink mono tracking-[-.3px]">
            {fmtBRL(card.used)}
          </span>
          <button className="px-[13px] py-[7px] rounded-md bg-accent text-white border border-accent text-[12px] font-semibold hover:bg-accent-hover transition-colors">
            Pagar fatura
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[100px_1fr_120px_140px_120px] px-5 py-2 border-b border-hair-2 bg-bg text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
        <div>Data</div>
        <div>Descrição</div>
        <div>Categoria</div>
        <div>Parcela</div>
        <div className="text-right">Valor</div>
      </div>

      <div>
        {card.charges.map((charge, i) => (
          <div
            key={charge.id}
            className={cn(
              "grid grid-cols-[100px_1fr_120px_140px_120px] items-center px-5 py-3 hover:bg-bg cursor-pointer transition-colors",
              i !== card.charges.length - 1 && "border-b border-hair-2"
            )}
          >
            <div className="text-[12px] text-ink-2 font-semibold">{fmtDate(charge.date)}</div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-ink tracking-[-.15px] truncate">
                {charge.desc}
              </div>
              {charge.meta && (
                <div className="text-[11px] text-ink-3 font-medium mt-px">{charge.meta}</div>
              )}
            </div>
            <div>
              <span className="text-[10.5px] font-semibold px-[8px] py-[2px] rounded border bg-hair-2 text-ink-2 border-hair">
                {charge.category}
              </span>
            </div>
            <div>
              {charge.installment ? (
                <span className="text-[11px] font-semibold text-warn bg-amber-50 border border-amber-200 px-[8px] py-[2px] rounded">
                  {charge.installment.current}/{charge.installment.total}x
                </span>
              ) : (
                <span className="text-[11px] text-ink-3 font-medium">À vista</span>
              )}
            </div>
            <div className="text-[13px] font-bold text-ink mono tabular tracking-[-.15px] text-right">
              {fmtBRL(charge.amount)}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-bg border-t border-hair flex items-center justify-between">
        <div className="text-[11.5px] text-ink-2 font-medium">
          {card.charges.length} compras · próximas parcelas serão lançadas automaticamente
        </div>
        <button className="text-[11.5px] font-semibold text-accent hover:text-accent-hover">
          Ver faturas anteriores →
        </button>
      </div>
    </div>
  )
}

function Stat({
  icon,
  variant,
  label,
  value,
  meta,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  variant: "indigo" | "ok" | "err" | "amber"
  label: string
  value: string
  meta: string
}) {
  const cls = {
    indigo: "border-l-accent",
    ok: "border-l-ok",
    err: "border-l-err",
    amber: "border-l-warn",
  }[variant]
  const iconBg = {
    indigo: "bg-accent-soft text-accent border-indigo-200",
    ok: "bg-emerald-50 text-ok border-emerald-200",
    err: "bg-red-50 text-err border-red-200",
    amber: "bg-amber-50 text-warn border-amber-200",
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

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${d}/${MONTHS_SHORT[parseInt(m) - 1]}`
}
