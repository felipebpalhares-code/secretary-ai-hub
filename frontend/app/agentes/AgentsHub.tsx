"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, CheckCircle2, FileEdit, FileText, MessageSquare, ChevronRight, Plus, type LucideIcon } from "lucide-react"
import { listAgents, listDocuments, listConversations, type Agent } from "@/lib/agents-api"
import { StatusPill } from "@/components/agents/StatusPill"
import { AgentAvatar } from "@/components/agents/AgentAvatar"
import { PermissionGate } from "@/components/auth/PermissionGate"

type AgentMetrics = {
  docs: number
  conversations: number
}

export function AgentsHub() {
  const router = useRouter()
  const [agents, setAgents]   = useState<Agent[] | null>(null)
  const [metrics, setMetrics] = useState<Record<string, AgentMetrics>>({})
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listAgents()
      .then((list) => {
        if (cancelled) return
        setAgents(list)
        // Métricas em paralelo (1 fetch de docs + 1 de conversas por agente)
        Promise.all(
          list.map(async (a) => {
            const [docs, convs] = await Promise.all([
              listDocuments(a.id).catch(() => []),
              listConversations(a.id).catch(() => []),
            ])
            return [a.id, { docs: docs.length, conversations: convs.length }] as const
          }),
        ).then((entries) => {
          if (!cancelled) setMetrics(Object.fromEntries(entries))
        })
      })
      .catch((e) => !cancelled && setError(String(e?.message ?? e)))
    return () => {
      cancelled = true
    }
  }, [])

  const kpis = useMemo(() => {
    if (!agents) return null
    const totalDocs = Object.values(metrics).reduce((sum, m) => sum + m.docs, 0)
    return {
      total:  agents.length,
      active: agents.filter((a) => a.status === "active").length,
      draft:  agents.filter((a) => a.status === "draft").length,
      docs:   totalDocs,
    }
  }, [agents, metrics])

  if (error) {
    return (
      <div className="flex-1 px-6 py-5 bg-bg-app">
        <div className="bg-danger-subtle border border-default rounded-xl p-6 text-body text-danger">
          Não foi possível carregar os agentes: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 bg-bg-app">
      {/* KPIs Apple */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Bot}          value={kpis?.total ?? null}  label="Agentes"      />
        <Kpi icon={CheckCircle2} value={kpis?.active ?? null} label="Ativos"       />
        <Kpi icon={FileEdit}     value={kpis?.draft ?? null}  label="Em rascunho"  />
        <Kpi icon={FileText}     value={kpis?.docs ?? null}   label="Docs treinados" />
      </div>

      {/* Lista / empty / skeleton */}
      {agents === null ? (
        <ListSkeleton />
      ) : agents.length === 0 ? (
        <EmptyAgents onCreate={() => router.push("/agentes/novo")} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {agents.map((a) => (
            <AgentRowCard
              key={a.id}
              agent={a}
              metrics={metrics[a.id]}
              onOpen={() => router.push(`/agentes/${a.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────────────────── KPI Apple ───────────────────── */

function Kpi({
  icon: IconComp,
  value,
  label,
}: {
  icon: LucideIcon
  value: number | null
  label: string
}) {
  return (
    <div className="bg-bg-surface border border-default rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-bg-subtle border border-default flex items-center justify-center text-text-secondary shrink-0">
        <IconComp size={18} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-title text-text-primary leading-none tabular-nums">
          {value === null ? <span className="inline-block w-6 h-6 bg-bg-muted rounded animate-pulse" /> : value}
        </div>
        <div className="text-tiny text-text-tertiary font-medium mt-1 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────── Card Linear (agent row) ───────────────────── */

function AgentRowCard({
  agent,
  metrics,
  onOpen,
}: {
  agent: Agent
  metrics?: AgentMetrics
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      className="text-left bg-bg-surface border border-default rounded-md p-4 transition hover:border-strong hover:shadow-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
    >
      <div className="flex items-start gap-3">
        <AgentAvatar name={agent.name} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-strong text-text-primary truncate">{agent.name}</span>
            <StatusPill status={agent.status} />
          </div>
          <div className="text-small text-text-secondary truncate">{agent.role}</div>

          <div className="flex items-center gap-3 mt-3 text-tiny text-text-tertiary">
            <Metric icon={FileText}      n={metrics?.docs}          unit="doc" />
            <span className="opacity-50">·</span>
            <Metric icon={MessageSquare} n={metrics?.conversations} unit="conversa" />
            <span className="opacity-50">·</span>
            <span>atualizado {formatRelativeDate(agent.updated_at)}</span>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="text-text-tertiary mt-1" />
      </div>
    </button>
  )
}

function Metric({
  icon: IconComp,
  n,
  unit,
}: {
  icon: LucideIcon
  n: number | undefined
  unit: string
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <IconComp size={12} strokeWidth={1.5} />
      {n === undefined ? "…" : `${n} ${unit}${n === 1 ? "" : "s"}`}
    </span>
  )
}

/* ───────────────────── Empty / Skeleton ───────────────────── */

function EmptyAgents({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-bg-surface border border-default rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-text-tertiary">
        <Bot size={64} strokeWidth={1.5} />
      </div>
      <div className="text-subtitle text-text-primary mt-4">Nenhum agente configurado ainda</div>
      <div className="text-body text-text-secondary mt-2 max-w-md leading-relaxed">
        Crie agentes especialistas (advogado, CFO, gestor de obras…) com persona,
        instruções e documentos pra treinar.
      </div>
      <PermissionGate module="agentes" action="criar">
        <button
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition"
        >
          <Plus size={16} strokeWidth={1.5} />
          Criar primeiro agente
        </button>
      </PermissionGate>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-bg-surface border border-default rounded-md p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-bg-muted rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-bg-muted rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───────────────────── helpers ───────────────────── */

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1)        return "agora"
  if (min < 60)       return `há ${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24)        return `há ${hr}h`
  const days = Math.floor(hr / 24)
  if (days < 7)       return `há ${days}d`
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}
