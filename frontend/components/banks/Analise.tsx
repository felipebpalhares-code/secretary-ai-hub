"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { fmtBRL, fmtCompact } from "@/lib/banks-data"

const SPEND_BY_CATEGORY = [
  { label: "Material obra", amount: 96200, color: "bg-orange-500", trend: "+12%", up: true, agent: "Engenheiro" },
  { label: "Mão de obra", amount: 68400, color: "bg-amber-500", trend: "+4%", up: true, agent: "Engenheiro" },
  { label: "Fornecedor", amount: 42820, color: "bg-blue-500", trend: "−8%", up: false, agent: "Diretor" },
  { label: "Cartão (PF)", amount: 29180, color: "bg-purple-500", trend: "+2%", up: true, agent: "Ricardo" },
  { label: "Educação", amount: 6050, color: "bg-pink-500", trend: "0%", up: false, agent: "Ana" },
  { label: "Imposto", amount: 20840, color: "bg-red-500", trend: "+5%", up: true, agent: "Marcos" },
  { label: "Consórcio", amount: 8790, color: "bg-indigo-500", trend: "0%", up: false, agent: "Ricardo" },
  { label: "Alimentação", amount: 4280, color: "bg-emerald-500", trend: "−3%", up: false, agent: "Auto" },
]

const MONTHS = [
  { label: "Nov", entrada: 320000, saida: 280000 },
  { label: "Dez", entrada: 380000, saida: 310000 },
  { label: "Jan", entrada: 290000, saida: 260000 },
  { label: "Fev", entrada: 410000, saida: 340000 },
  { label: "Mar", entrada: 460000, saida: 390000 },
  { label: "Abr", entrada: 487000, saida: 358450, current: true },
]

const TOP_FORNECEDORES = [
  { name: "Siderúrgica SP", entity: "Vimar", amount: 96200, txs: 4, trend: 12 },
  { name: "Empreiteiro Roberto", entity: "Vimar", amount: 68400, txs: 2, trend: 0 },
  { name: "AWS", entity: "PalharesTech", amount: 12840, txs: 1, trend: -5 },
  { name: "ArtCasa Esquadrias", entity: "Vimar", amount: 32400, txs: 1, trend: 8 },
  { name: "Hidráulica Sul", entity: "Vimar", amount: 18000, txs: 1, trend: 0 },
  { name: "Salesforce", entity: "PalharesTech", amount: 3420, txs: 1, trend: 0 },
]

const PATRIMONIO_EVOLUTION = [
  { month: "Nov", value: 1320000 },
  { month: "Dez", value: 1380000 },
  { month: "Jan", value: 1410000 },
  { month: "Fev", value: 1450000 },
  { month: "Mar", value: 1520000 },
  { month: "Abr", value: 1571450, current: true },
]

const RICARDO_INSIGHTS = [
  {
    type: "alert" as const,
    icon: "alert" as const,
    title: "Material da obra Bloco A 12% acima da média",
    detail:
      "R$ 96.200 vs R$ 85.700 média 6 meses. Concentrado em aço (+14%) e cimento (+8%). Sugestão: renegociar com Siderúrgica SP — gasto cresceu R$ 32k em 4 meses.",
  },
  {
    type: "opportunity" as const,
    icon: "chart" as const,
    title: "Fluxo de caixa positivo permite aplicar R$ 80k",
    detail:
      "Saldo total subiu R$ 128k este mês com vendas Vimar. Posso aplicar R$ 80k em CDB Nubank a 112% CDI? Mantém R$ 240k de reserva operacional.",
  },
  {
    type: "info" as const,
    icon: "check" as const,
    title: "PalharesTech Q1 fechado · IRPJ menor que projetado",
    detail:
      "DARF de R$ 12.4k vs estimativa R$ 14.8k. Diferença explicada por aumento das despesas dedutíveis (cloud + folha). Margem operacional Q1: 32%.",
  },
  {
    type: "alert" as const,
    icon: "clock" as const,
    title: "Boleto cartão Itaú Black vence em 16d com R$ 18,4k",
    detail:
      "Maior fatura do ano. 3 parcelas de viagem LATAM começaram. Preferir débito automático ou pagar manual? Saldo Itaú PF tem R$ 47.810.",
  },
]

export function Analise() {
  const [period, setPeriod] = useState<"mes" | "trimestre" | "ano">("mes")

  const totalSpending = SPEND_BY_CATEGORY.reduce((s, c) => s + c.amount, 0)
  const maxSpending = Math.max(...SPEND_BY_CATEGORY.map((c) => c.amount))

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Stat
          icon="chart"
          variant="ok"
          label="Patrimônio"
          value={fmtCompact(1571450)}
          meta="+R$ 51k vs mês anterior · +3,4%"
        />
        <Stat
          icon="check"
          variant="indigo"
          label="Receita do mês"
          value={fmtCompact(487000)}
          meta="+5,8% vs março · 62 transações"
        />
        <Stat
          icon="send"
          variant="err"
          label="Despesas do mês"
          value={fmtCompact(358450)}
          meta="−8,1% vs março · 184 transações"
        />
        <Stat
          icon="bot"
          variant="amber"
          label="Insights pendentes"
          value={String(RICARDO_INSIGHTS.length)}
          meta="Ricardo aguardando sua decisão"
        />
      </div>

      {/* Period switch */}
      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-card border border-hair rounded-md p-[3px]">
          {(["mes", "trimestre", "ano"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-[12px] py-[6px] rounded text-[12px] font-semibold transition-colors capitalize",
                period === p ? "bg-accent text-white" : "text-ink-2 hover:bg-bg"
              )}
            >
              {p === "mes" ? "Este mês" : p === "trimestre" ? "Trimestre" : "Ano"}
            </button>
          ))}
        </div>
        <button className="px-[13px] py-[7px] rounded-md border border-hair bg-card text-[12px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors flex items-center gap-1">
          <Icon name="send" size={12} />
          Exportar relatório PDF
        </button>
      </div>

      {/* Ricardo insights */}
      <div>
        <div className="flex items-center gap-2 mb-[10px]">
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-ok border border-emerald-200 flex items-center justify-center text-base">
            💰
          </div>
          <div className="text-[13px] font-bold text-ink tracking-[-.15px]">
            Insights do Ricardo · CFO
          </div>
          <span className="text-[10.5px] text-ink-3 font-medium">{RICARDO_INSIGHTS.length} pendentes</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {RICARDO_INSIGHTS.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <FlowChart />
        <PatrimonioChart />
      </div>

      {/* Categories */}
      <div className="bg-card border border-hair rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[13px] font-bold text-ink tracking-[-.15px]">
              Gastos por categoria · abril
            </div>
            <div className="text-[11px] text-ink-3 font-medium mt-px">
              Total: {fmtBRL(totalSpending)} · Ricardo classifica automaticamente
            </div>
          </div>
          <button className="text-[11.5px] font-semibold text-accent hover:text-accent-hover">
            Ver detalhes →
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {SPEND_BY_CATEGORY.sort((a, b) => b.amount - a.amount).map((cat) => (
            <CategoryRow
              key={cat.label}
              label={cat.label}
              amount={cat.amount}
              total={maxSpending}
              color={cat.color}
              trend={cat.trend}
              up={cat.up}
              agent={cat.agent}
            />
          ))}
        </div>
      </div>

      {/* Top fornecedores */}
      <div className="bg-card border border-hair rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-hair flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold text-ink tracking-[-.15px]">
              Top fornecedores do mês
            </div>
            <div className="text-[11px] text-ink-3 font-medium mt-px">
              Onde seu dinheiro foi · ordenado por volume
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[40px_1fr_120px_100px_140px] px-5 py-2 border-b border-hair-2 bg-bg text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
          <div>#</div>
          <div>Fornecedor</div>
          <div>Entidade</div>
          <div>Transações</div>
          <div className="text-right">Volume · variação</div>
        </div>
        {TOP_FORNECEDORES.map((f, i) => (
          <div
            key={f.name}
            className={cn(
              "grid grid-cols-[40px_1fr_120px_100px_140px] items-center px-5 py-3 hover:bg-bg cursor-pointer transition-colors",
              i !== TOP_FORNECEDORES.length - 1 && "border-b border-hair-2"
            )}
          >
            <div className="text-[14px] font-bold text-ink-3 mono tabular">
              #{i + 1}
            </div>
            <div className="text-[13px] font-bold text-ink tracking-[-.15px]">{f.name}</div>
            <div className="text-[11.5px] font-semibold text-ink-2">{f.entity}</div>
            <div className="text-[11.5px] text-ink-2 font-medium">
              {f.txs} {f.txs === 1 ? "transação" : "transações"}
            </div>
            <div className="text-right">
              <div className="text-[14px] font-bold text-ink mono tabular tracking-[-.15px]">
                {fmtBRL(f.amount)}
              </div>
              <div
                className={cn(
                  "text-[10.5px] font-bold mt-px",
                  f.trend > 0 ? "text-err" : f.trend < 0 ? "text-ok" : "text-ink-3"
                )}
              >
                {f.trend > 0 ? "+" : ""}
                {f.trend}% vs mês ant.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightCard({
  insight,
}: {
  insight: { type: "alert" | "opportunity" | "info"; icon: Parameters<typeof Icon>[0]["name"]; title: string; detail: string }
}) {
  const cls =
    insight.type === "alert"
      ? "border-l-err"
      : insight.type === "opportunity"
        ? "border-l-ok"
        : "border-l-accent"
  const iconCls =
    insight.type === "alert"
      ? "bg-red-50 text-err border-red-200"
      : insight.type === "opportunity"
        ? "bg-emerald-50 text-ok border-emerald-200"
        : "bg-accent-soft text-accent border-indigo-200"
  const tagCls =
    insight.type === "alert"
      ? "bg-red-50 text-err border-red-200"
      : insight.type === "opportunity"
        ? "bg-emerald-50 text-ok border-emerald-200"
        : "bg-accent-soft text-accent border-indigo-200"
  const tagLabel =
    insight.type === "alert" ? "Atenção" : insight.type === "opportunity" ? "Oportunidade" : "Informação"

  return (
    <div className={cn("bg-card border border-hair border-l-[3px] rounded-md p-4", cls)}>
      <div className="flex items-start gap-3 mb-2">
        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center border shrink-0", iconCls)}>
          <Icon name={insight.icon} size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-[9.5px] font-bold px-[7px] py-[2px] rounded border tracking-[.04em] uppercase",
                tagCls
              )}
            >
              {tagLabel}
            </span>
          </div>
          <div className="text-[13px] font-bold text-ink tracking-[-.15px] leading-[1.35]">
            {insight.title}
          </div>
        </div>
      </div>
      <div className="text-[11.5px] text-ink-2 leading-[1.55] font-medium">{insight.detail}</div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-hair-2">
        <button className="flex-1 px-2 py-[6px] rounded-md bg-accent text-white border border-accent text-[11.5px] font-semibold hover:bg-accent-hover transition-colors">
          Aprovar
        </button>
        <button className="flex-1 px-2 py-[6px] rounded-md bg-card border border-hair text-ink text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
          Mais detalhes
        </button>
        <button className="px-3 py-[6px] rounded-md bg-card border border-hair text-ink-3 text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
          Dispensar
        </button>
      </div>
    </div>
  )
}

function FlowChart() {
  const max = Math.max(...MONTHS.flatMap((m) => [m.entrada, m.saida]))
  return (
    <div className="bg-card border border-hair rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] font-bold text-ink tracking-[-.15px]">
            Fluxo de caixa · 6 meses
          </div>
          <div className="text-[11px] text-ink-3 font-medium mt-px">
            Entradas vs saídas mensais consolidadas
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] font-medium">
          <div className="flex items-center gap-1">
            <span className="w-[10px] h-[10px] bg-ok rounded-sm" />
            <span className="text-ink-2">Entrada</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-[10px] h-[10px] bg-err rounded-sm" />
            <span className="text-ink-2">Saída</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-3 h-[180px] items-end">
        {MONTHS.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-1 h-full">
            <div className="flex-1 w-full flex items-end gap-1">
              <div
                className={cn(
                  "flex-1 rounded-t bg-ok hover:opacity-80 transition-opacity relative group cursor-pointer",
                  m.current && "ring-2 ring-ok ring-offset-1"
                )}
                style={{ height: `${(m.entrada / max) * 100}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-ink text-white text-[9px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap mono">
                  {fmtCompact(m.entrada)}
                </div>
              </div>
              <div
                className={cn(
                  "flex-1 rounded-t bg-err hover:opacity-80 transition-opacity relative group cursor-pointer",
                  m.current && "ring-2 ring-err ring-offset-1"
                )}
                style={{ height: `${(m.saida / max) * 100}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-ink text-white text-[9px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap mono">
                  {fmtCompact(m.saida)}
                </div>
              </div>
            </div>
            <div className={cn("text-[10.5px] font-bold", m.current ? "text-accent" : "text-ink-3")}>
              {m.label}
            </div>
            <div className="text-[10px] text-ink-3 font-medium mono">
              +{fmtCompact(m.entrada - m.saida)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatrimonioChart() {
  const max = Math.max(...PATRIMONIO_EVOLUTION.map((p) => p.value))
  const min = Math.min(...PATRIMONIO_EVOLUTION.map((p) => p.value))
  const range = max - min

  // build SVG points
  const w = 100
  const h = 100
  const points = PATRIMONIO_EVOLUTION.map((p, i) => {
    const x = (i / (PATRIMONIO_EVOLUTION.length - 1)) * w
    const y = h - ((p.value - min) / range) * h * 0.8 - 10
    return { x, y, ...p }
  })

  const pathD = points.reduce(
    (acc, pt, i) => acc + (i === 0 ? `M ${pt.x},${pt.y}` : ` L ${pt.x},${pt.y}`),
    ""
  )
  const areaD = pathD + ` L ${w},${h} L 0,${h} Z`

  return (
    <div className="bg-card border border-hair rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[13px] font-bold text-ink tracking-[-.15px]">
            Evolução do patrimônio
          </div>
          <div className="text-[11px] text-ink-3 font-medium mt-px">
            Saldo consolidado em todas as contas
          </div>
        </div>
        <div>
          <div className="text-[18px] font-bold text-ink mono tabular tracking-[-.3px] text-right">
            {fmtCompact(1571450)}
          </div>
          <div className="text-[10.5px] font-bold text-ok text-right">+19% últimos 6m</div>
        </div>
      </div>
      <div className="relative w-full" style={{ paddingBottom: "50%" }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <linearGradient id="patrimonioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* gridlines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgb(226 232 240)" strokeWidth="0.2" />
          ))}
          <path d={areaD} fill="url(#patrimonioGrad)" />
          <path d={pathD} fill="none" stroke="rgb(79, 70, 229)" strokeWidth="0.6" />
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={pt.current ? 1.5 : 0.9}
              fill={pt.current ? "rgb(79, 70, 229)" : "white"}
              stroke="rgb(79, 70, 229)"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-6 mt-2 text-[10.5px] font-bold text-ink-3">
        {PATRIMONIO_EVOLUTION.map((p) => (
          <div
            key={p.month}
            className={cn("text-center", p.current && "text-accent")}
          >
            {p.month}
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryRow({
  label,
  amount,
  total,
  color,
  trend,
  up,
  agent,
}: {
  label: string
  amount: number
  total: number
  color: string
  trend: string
  up: boolean
  agent: string
}) {
  const pct = (amount / total) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={cn("w-3 h-3 rounded-sm", color)} />
          <span className="text-[12.5px] font-bold text-ink tracking-[-.1px]">{label}</span>
          <span className="text-[10.5px] text-ink-3 font-medium">· {agent}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-[11px] font-bold",
              up ? "text-err" : "text-ok"
            )}
          >
            {trend}
          </span>
          <span className="text-[13px] font-bold text-ink mono tabular tracking-[-.15px] w-[100px] text-right">
            {fmtBRL(amount)}
          </span>
        </div>
      </div>
      <div className="h-2 bg-hair rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
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
