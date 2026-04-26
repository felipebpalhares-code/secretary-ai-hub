"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import {
  TRIBUTOS_PROXIMOS,
  TRIBUTOS_PAGOS,
  CERTIDOES,
  KIND_LABEL,
  KIND_COLOR,
  daysFromToday,
  type Tributo,
} from "@/lib/tributos-data"
import { ENTITIES, fmtBRL, type Entity } from "@/lib/banks-data"

type SubTab = "proximos" | "calendario" | "pagos" | "certidoes"

export function Tributos() {
  const [tab, setTab] = useState<SubTab>("proximos")
  const [filterEntity, setFilterEntity] = useState<"all" | Entity>("all")

  const filtered =
    filterEntity === "all"
      ? TRIBUTOS_PROXIMOS
      : TRIBUTOS_PROXIMOS.filter((t) => t.entity === filterEntity)

  const totalPagar = filtered.reduce((s, t) => s + t.amount, 0)
  const venceMaio = filtered.filter((t) => {
    const d = daysFromToday(t.dueDate)
    return d >= 0 && d <= 30
  })
  const totalPagosYTD =
    TRIBUTOS_PAGOS.reduce((s, t) => s + t.amount, 0) + 124800 // mock acumulado
  const certidoesVencendo = CERTIDOES.filter((c) => c.status === "vencendo")

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Stat
          icon="alert"
          variant="err"
          label="Tributos a pagar"
          value={fmtBRL(totalPagar)}
          meta={`${filtered.length} obrigações em aberto`}
        />
        <Stat
          icon="clock"
          variant="amber"
          label="Vence próx. 30 dias"
          value={fmtBRL(venceMaio.reduce((s, t) => s + t.amount, 0))}
          meta={`${venceMaio.length} obrigações`}
        />
        <Stat
          icon="check"
          variant="ok"
          label="Pago no ano"
          value={fmtBRL(totalPagosYTD)}
          meta="29 obrigações 2026 YTD"
        />
        <Stat
          icon="shield"
          variant="indigo"
          label="Certidões vencendo"
          value={String(certidoesVencendo.length)}
          meta={
            certidoesVencendo.length > 0
              ? `${certidoesVencendo[0].name} · ${certidoesVencendo[0].daysLeft}d`
              : "Todas regulares"
          }
        />
      </div>

      {/* Marcos banner */}
      <div className="bg-card border border-hair border-l-[3px] border-l-warn rounded-md px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-amber-50 text-warn border border-amber-200 flex items-center justify-center text-base">
          🏛️
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
            Marcos · especialista governamental monitorando 12 obrigações
          </div>
          <div className="text-[11px] text-ink-2 font-medium mt-px">
            Gera DARF/GPS/FGTS automaticamente · alertas 30/15/7 dias antes · agenda pagamento via PIX
          </div>
        </div>
        <button className="px-[13px] py-[7px] rounded-md border border-hair bg-card text-[12px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors flex items-center gap-1">
          <Icon name="chat" size={12} />
          Conversar
        </button>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-card border border-hair rounded-md p-[3px] self-start">
        {(
          [
            {
              id: "proximos" as const,
              label: "Próximos",
              icon: "alert" as const,
              count: TRIBUTOS_PROXIMOS.length,
            },
            { id: "calendario" as const, label: "Calendário fiscal", icon: "calendar" as const },
            { id: "pagos" as const, label: "Pagos", icon: "check" as const, count: TRIBUTOS_PAGOS.length },
            {
              id: "certidoes" as const,
              label: "Certidões",
              icon: "shield" as const,
              count: CERTIDOES.length,
            },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-[12px] py-[6px] rounded text-[12px] font-semibold flex items-center gap-[5px] transition-colors",
              tab === t.id ? "bg-accent text-white" : "text-ink-2 hover:bg-bg"
            )}
          >
            <Icon name={t.icon} size={12} />
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-bold px-[5px] py-px rounded",
                  tab === t.id ? "bg-white/20 text-white" : "bg-hair-2 text-ink-3"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Entity filter (only on proximos/pagos) */}
      {(tab === "proximos" || tab === "pagos") && (
        <div className="flex gap-1 flex-wrap items-center">
          <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] mr-2">
            Entidade
          </span>
          <FilterChip active={filterEntity === "all"} onClick={() => setFilterEntity("all")}>
            Todas
          </FilterChip>
          {ENTITIES.map((e) => (
            <FilterChip
              key={e.id}
              active={filterEntity === e.id}
              onClick={() => setFilterEntity(e.id)}
            >
              {e.short}
            </FilterChip>
          ))}
        </div>
      )}

      {tab === "proximos" && <TributoList list={filtered} />}
      {tab === "calendario" && <CalendarView />}
      {tab === "pagos" && (
        <TributoList
          list={
            filterEntity === "all"
              ? TRIBUTOS_PAGOS
              : TRIBUTOS_PAGOS.filter((t) => t.entity === filterEntity)
          }
          paid
        />
      )}
      {tab === "certidoes" && <CertidoesList />}
    </div>
  )
}

function TributoList({ list, paid }: { list: Tributo[]; paid?: boolean }) {
  if (list.length === 0) {
    return (
      <div className="bg-card border border-hair rounded-lg px-6 py-12 text-center text-ink-3 font-medium">
        Nenhum tributo encontrado nos filtros
      </div>
    )
  }
  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="grid grid-cols-[80px_1fr_120px_140px_120px_140px] px-4 py-2 border-b border-hair bg-bg text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
        <div>Tributo</div>
        <div>Descrição</div>
        <div>Entidade</div>
        <div>{paid ? "Pago em" : "Vence em"}</div>
        <div>Competência</div>
        <div className="text-right">Valor</div>
      </div>
      {list.map((t, i) => (
        <TributoRow key={t.id} tributo={t} last={i === list.length - 1} paid={paid} />
      ))}
      <div className="grid grid-cols-[80px_1fr_120px_140px_120px_140px] px-4 py-3 border-t border-hair bg-bg text-[12px]">
        <div className="col-span-5 text-right text-ink-3 font-bold uppercase text-[10.5px] tracking-[.06em]">
          Total
        </div>
        <div className="text-right text-[14px] font-bold text-ink mono tabular tracking-[-.15px]">
          {fmtBRL(list.reduce((s, t) => s + t.amount, 0))}
        </div>
      </div>
    </div>
  )
}

function TributoRow({ tributo, last, paid }: { tributo: Tributo; last: boolean; paid?: boolean }) {
  const days = daysFromToday(tributo.dueDate)
  const entity = ENTITIES.find((e) => e.id === tributo.entity)!

  const dueLabel = paid && tributo.paidDate
    ? formatBR(tributo.paidDate)
    : days < 0
      ? `${Math.abs(days)}d atrás`
      : days === 0
        ? "Hoje"
        : days === 1
          ? "Amanhã"
          : `${days} dias`

  const dueCls = paid
    ? "text-ok"
    : days < 0
      ? "text-err"
      : days <= 5
        ? "text-err"
        : days <= 15
          ? "text-warn"
          : "text-ink-2"

  return (
    <div
      className={cn(
        "grid grid-cols-[80px_1fr_120px_140px_120px_140px] items-center gap-3 px-4 py-3 hover:bg-bg cursor-pointer transition-colors",
        !last && "border-b border-hair-2"
      )}
    >
      <div>
        <span
          className={cn(
            "text-[11px] font-bold px-[8px] py-[3px] rounded border tracking-[.04em] uppercase",
            KIND_COLOR[tributo.kind]
          )}
        >
          {KIND_LABEL[tributo.kind]}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-bold text-ink tracking-[-.15px] truncate">{tributo.desc}</div>
          {tributo.status === "agendado" && (
            <span className="text-[9.5px] font-bold text-warn bg-amber-50 border border-amber-200 px-[6px] py-px rounded uppercase tracking-[.03em]">
              Agendado
            </span>
          )}
          {tributo.agentNote && <span className="text-[10.5px]">🏛️</span>}
        </div>
        {tributo.meta && (
          <div className="text-[11px] text-ink-3 font-medium mt-px truncate">{tributo.meta}</div>
        )}
      </div>

      <div className="text-[11.5px] font-semibold text-ink-2">{entity.short}</div>

      <div>
        <div className={cn("text-[12.5px] font-bold mono tabular tracking-[-.1px]", dueCls)}>
          {dueLabel}
        </div>
        <div className="text-[10.5px] text-ink-3 font-medium mono">
          {formatBR(paid ? tributo.paidDate ?? tributo.dueDate : tributo.dueDate)}
        </div>
      </div>

      <div className="text-[11.5px] font-semibold text-ink-2">{tributo.competencia}</div>

      <div className="text-right">
        <div className="text-[14px] font-bold text-ink mono tabular tracking-[-.2px]">
          {fmtBRL(tributo.amount)}
        </div>
      </div>
    </div>
  )
}

function CalendarView() {
  // group by month
  const byMonth = new Map<string, Tributo[]>()
  TRIBUTOS_PROXIMOS.forEach((t) => {
    const m = t.dueDate.slice(0, 7) // yyyy-mm
    const arr = byMonth.get(m) ?? []
    arr.push(t)
    byMonth.set(m, arr)
  })

  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from(byMonth.entries())
        .sort()
        .map(([month, items]) => (
          <MonthCard key={month} month={month} items={items} />
        ))}
    </div>
  )
}

function MonthCard({ month, items }: { month: string; items: Tributo[] }) {
  const [y, m] = month.split("-")
  const total = items.reduce((s, t) => s + t.amount, 0)
  const monthLabel = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][
    parseInt(m) - 1
  ]

  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-hair bg-bg flex items-center justify-between">
        <div>
          <div className="text-[14px] font-bold text-ink tracking-[-.2px]">
            {monthLabel} {y}
          </div>
          <div className="text-[10.5px] text-ink-3 font-medium mt-px">
            {items.length} {items.length === 1 ? "tributo" : "tributos"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] text-ink-3 font-medium uppercase tracking-[.05em]">Total</div>
          <div className="text-[15px] font-bold text-ink mono tabular tracking-[-.2px]">{fmtBRL(total)}</div>
        </div>
      </div>
      {items
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .map((t, i) => {
          const days = daysFromToday(t.dueDate)
          const day = t.dueDate.slice(8, 10)
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2 hover:bg-bg transition-colors",
                i !== items.length - 1 && "border-b border-hair-2"
              )}
            >
              <div className="w-9 text-center">
                <div className="text-[15px] font-bold text-ink leading-none tabular">{day}</div>
                <div className="text-[8.5px] text-ink-3 uppercase font-bold tracking-[.06em] mt-px">
                  {monthLabel}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-[7px] py-px rounded border uppercase",
                      KIND_COLOR[t.kind]
                    )}
                  >
                    {KIND_LABEL[t.kind]}
                  </span>
                  <div className="text-[12.5px] font-bold text-ink truncate tracking-[-.1px]">
                    {t.desc}
                  </div>
                </div>
                <div className="text-[10.5px] text-ink-3 font-medium mt-px">
                  {ENTITIES.find((e) => e.id === t.entity)?.short} · {t.competencia}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold text-ink mono tabular tracking-[-.15px]">
                  {fmtBRL(t.amount)}
                </div>
                <div
                  className={cn(
                    "text-[10px] font-bold mt-px",
                    days <= 5 ? "text-err" : days <= 15 ? "text-warn" : "text-ink-3"
                  )}
                >
                  em {days}d
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

function CertidoesList() {
  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="grid grid-cols-[1fr_140px_140px_120px_120px] px-4 py-2 border-b border-hair bg-bg text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
        <div>Certidão</div>
        <div>Entidade</div>
        <div>Status</div>
        <div>Validade</div>
        <div className="text-right">Ações</div>
      </div>
      {CERTIDOES.map((c, i) => {
        const entity = ENTITIES.find((e) => e.id === c.entity)!
        const statusCls = {
          regular: "bg-emerald-50 text-emerald-700 border-emerald-200",
          vencendo: "bg-amber-50 text-amber-700 border-amber-200",
          vencida: "bg-red-50 text-red-700 border-red-200",
          pendente: "bg-hair-2 text-ink-2 border-hair",
        }[c.status]

        return (
          <div
            key={c.id}
            className={cn(
              "grid grid-cols-[1fr_140px_140px_120px_120px] items-center gap-3 px-4 py-3 hover:bg-bg cursor-pointer transition-colors",
              i !== CERTIDOES.length - 1 && "border-b border-hair-2"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center border shrink-0",
                  c.status === "regular"
                    ? "bg-emerald-50 text-ok border-emerald-200"
                    : c.status === "vencendo"
                      ? "bg-amber-50 text-warn border-amber-200"
                      : "bg-red-50 text-err border-red-200"
                )}
              >
                <Icon name="shield" size={14} />
              </div>
              <div className="text-[13px] font-bold text-ink tracking-[-.15px] truncate">{c.name}</div>
            </div>
            <div className="text-[11.5px] font-semibold text-ink-2">{entity.short}</div>
            <div>
              <span
                className={cn(
                  "text-[10.5px] font-bold px-[8px] py-[2px] rounded border capitalize",
                  statusCls
                )}
              >
                {c.status === "regular" ? "Regular" : c.status === "vencendo" ? "Vence em breve" : "Vencida"}
              </span>
            </div>
            <div>
              <div className="text-[12px] font-bold text-ink mono tabular">{formatBR(c.expiry)}</div>
              {c.daysLeft !== undefined && (
                <div
                  className={cn(
                    "text-[10.5px] font-medium mt-px",
                    c.daysLeft <= 30
                      ? "text-err font-bold"
                      : c.daysLeft <= 60
                        ? "text-warn"
                        : "text-ink-3"
                  )}
                >
                  {c.daysLeft}d restantes
                </div>
              )}
            </div>
            <div className="flex justify-end gap-1">
              <button className="px-[10px] py-[5px] rounded-md bg-card border border-hair text-ink-2 text-[11px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
                Baixar
              </button>
              <button className="px-[10px] py-[5px] rounded-md bg-accent-soft border border-indigo-200 text-accent text-[11px] font-semibold hover:bg-indigo-100 transition-colors">
                Renovar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FilterChip({
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
        "px-[10px] py-[3px] rounded-full border text-[11px] font-semibold transition-colors",
        active
          ? "bg-accent-soft border-indigo-200 text-accent"
          : "bg-card border-hair text-ink-2 hover:border-ink-4"
      )}
    >
      {children}
    </button>
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

function formatBR(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}
