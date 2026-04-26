"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { TOTAL_BALANCE, MONTH_FLOW, fmtBRL, fmtCompact } from "@/lib/banks-data"

export function BalanceHero() {
  const [hidden, setHidden] = useState(false)

  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] items-end px-6 py-5 border-b border-hair-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
              Patrimônio em contas · 10 contas conectadas
            </span>
            <button
              onClick={() => setHidden((s) => !s)}
              className="text-ink-3 hover:text-accent p-1 rounded transition-colors"
              title={hidden ? "Mostrar" : "Ocultar"}
            >
              <Icon name="eye" size={13} />
            </button>
          </div>
          <div className="text-[34px] font-bold text-ink tabular tracking-[-1px] leading-none">
            {hidden ? "R$ ●●●●●●●●" : fmtBRL(TOTAL_BALANCE)}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[12.5px]">
            <span className="inline-flex items-center gap-1 font-semibold text-ok">
              <Icon name="chart" size={13} />
              +R$ 12.450 (+1,0%)
            </span>
            <span className="text-ink-3 font-medium">este mês</span>
            <span className="text-ink-4">·</span>
            <span className="text-ink-3 font-medium">Atualizado há 2 min</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.06em] mb-1">
            Projeção 30 dias
          </div>
          <div className="text-[18px] font-bold text-ink mono tracking-[-.3px]">
            {hidden ? "●●●●●●" : fmtCompact(MONTH_FLOW.projecao)}
          </div>
          <div className="text-[10.5px] text-ink-3 font-medium mt-1">
            Considera boletos e recebimentos previstos
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-hair-2">
        <FlowStat
          label="Entrada do mês"
          value={hidden ? "●●●●●●" : fmtCompact(MONTH_FLOW.entrada)}
          variant="up"
          meta="62 transações"
          icon="check"
        />
        <FlowStat
          label="Saída do mês"
          value={hidden ? "●●●●●●" : fmtCompact(MONTH_FLOW.saida)}
          variant="down"
          meta="184 transações"
          icon="send"
        />
        <FlowStat
          label="Saldo do período"
          value={hidden ? "●●●●●●" : fmtCompact(MONTH_FLOW.saldo)}
          variant="neutral"
          meta="+R$ 128.550 vs abr/2025"
          icon="chart"
        />
      </div>
    </div>
  )
}

function FlowStat({
  label,
  value,
  variant,
  meta,
  icon,
}: {
  label: string
  value: string
  variant: "up" | "down" | "neutral"
  meta: string
  icon: Parameters<typeof Icon>[0]["name"]
}) {
  const cls = {
    up: "text-ok",
    down: "text-err",
    neutral: "text-ink",
  }[variant]
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 mb-1">
        <div
          className={cn(
            "w-6 h-6 rounded-md border flex items-center justify-center",
            variant === "up"
              ? "bg-emerald-50 border-emerald-200 text-ok"
              : variant === "down"
                ? "bg-red-50 border-red-200 text-err"
                : "bg-bg border-hair text-ink-2"
          )}
        >
          <Icon name={icon} size={12} />
        </div>
        <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">{label}</span>
      </div>
      <div className={cn("text-[18px] font-bold mono tracking-[-.3px]", cls)}>{value}</div>
      <div className="text-[10.5px] text-ink-3 font-medium mt-0.5">{meta}</div>
    </div>
  )
}
