"use client"
import { useState } from "react"
import { cn } from "@/lib/cn"

const ROUTING = [
  { kw: "processo, prazo", emoji: "⚖️", agent: "Dr. Silva" },
  { kw: "fatura, dinheiro", emoji: "💰", agent: "Ricardo" },
  { kw: "obra, bloco", emoji: "🏗️", agent: "Engenheiro" },
  { kw: "agenda, família", emoji: "🌸", agent: "Ana" },
  { kw: "email, resposta", emoji: "✉️", agent: "Clara" },
]

const SCHEDULE = [
  { name: "Briefing diário", time: "07:00" },
  { name: "Alertas manhã", time: "12:00" },
  { name: "Resumo do dia", time: "18:00" },
  { name: "Urgências", time: "24/7" },
]

const ALERTS = [
  { emoji: "⚖️", name: "Prazos jurídicos", desc: "Processos, contratos, certidões", on: true },
  { emoji: "💰", name: "Vencimentos", desc: "Faturas, boletos, impostos", on: true },
  { emoji: "📅", name: "Compromissos", desc: "Agenda e aniversários", on: true },
  { emoji: "🏗️", name: "Obras", desc: "Cronograma, custo, equipe", on: true },
  { emoji: "🩺", name: "Saúde", desc: "Consultas, exames", on: false },
]

export function ConfigPanel() {
  const [scheduleOn, setScheduleOn] = useState<Record<string, boolean>>(
    Object.fromEntries(SCHEDULE.map((s) => [s.name, true]))
  )
  const [alertsOn, setAlertsOn] = useState<Record<string, boolean>>(
    Object.fromEntries(ALERTS.map((a) => [a.name, a.on]))
  )

  return (
    <div className="p-4 flex flex-col gap-3 overflow-y-auto">
      <CfgBlock title="Roteamento por palavra-chave">
        {ROUTING.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-[6px] border-b border-hair-2 last:border-b-0 text-[11.5px]"
          >
            <span className="bg-card border border-hair px-[7px] py-px rounded mono text-[10px] text-ink-2 font-semibold">
              {r.kw}
            </span>
            <span className="text-[9px] text-ink-3">→</span>
            <span className="flex items-center gap-[5px] font-semibold text-ink tracking-[-.1px]">
              <span className="w-[18px] h-[18px] rounded bg-card border border-hair flex items-center justify-center text-[10px] shrink-0">
                {r.emoji}
              </span>
              {r.agent}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 py-[6px] text-[11.5px]">
          <span className="bg-accent-soft border border-indigo-200 text-accent px-[7px] py-px rounded mono text-[10px] font-semibold">
            livre
          </span>
          <span className="text-[9px] text-ink-3">→</span>
          <span className="font-semibold text-ink">Router IA</span>
        </div>
      </CfgBlock>

      <CfgBlock title="Horários de alertas">
        {SCHEDULE.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-2 py-[7px] border-b border-hair-2 last:border-b-0 text-[11.5px]"
          >
            <span className="font-semibold text-ink flex-1">{s.name}</span>
            <span className="bg-card border border-hair px-2 py-px rounded mono text-[10.5px] text-ink font-semibold">
              {s.time}
            </span>
            <Toggle on={scheduleOn[s.name]} onClick={() => setScheduleOn((x) => ({ ...x, [s.name]: !x[s.name] }))} />
          </div>
        ))}
      </CfgBlock>

      <CfgBlock title="Não perturbe">
        <div className="flex items-center gap-[7px] text-[11.5px] font-semibold text-ink">
          <span>De</span>
          <span className="bg-card border border-hair rounded px-2 py-[3px] mono text-[11px]">22:00</span>
          <span>até</span>
          <span className="bg-card border border-hair rounded px-2 py-[3px] mono text-[11px]">06:30</span>
        </div>
        <div className="text-[10.5px] text-ink-3 mt-2 font-medium">
          Urgências sempre passam.{" "}
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold px-[6px] py-px rounded ml-1">
            Ativo
          </span>
        </div>
      </CfgBlock>

      <CfgBlock title="Tipos de alerta">
        {ALERTS.map((a) => (
          <div key={a.name} className="flex items-center gap-[9px] py-[7px] border-b border-hair-2 last:border-b-0 text-[11.5px]">
            <span className="text-[14px] w-[22px] text-center">{a.emoji}</span>
            <div className="flex-1">
              <div className="font-semibold text-ink tracking-[-.1px]">{a.name}</div>
              <div className="text-[10px] text-ink-3 mt-px font-medium">{a.desc}</div>
            </div>
            <Toggle on={alertsOn[a.name]} onClick={() => setAlertsOn((x) => ({ ...x, [a.name]: !x[a.name] }))} />
          </div>
        ))}
      </CfgBlock>
    </div>
  )
}

function CfgBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg border border-hair rounded-md p-[12px_14px]">
      <div className="text-[11px] font-bold text-ink-2 mb-2 uppercase tracking-[.05em]">{title}</div>
      {children}
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-7 h-4 rounded-full transition-colors shrink-0",
        on ? "bg-accent" : "bg-ink-4"
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] w-3 h-3 bg-card rounded-full shadow-sm transition-all",
          on ? "left-[14px]" : "left-[2px]"
        )}
      />
    </button>
  )
}
