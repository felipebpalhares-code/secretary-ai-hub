"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react"
import { type Agent, getAgent } from "@/lib/agents-api"
import { AgentDetailHeader } from "@/components/agents/AgentDetailHeader"
import { AgentTabs, tabFromParams } from "@/components/agents/AgentTabs"
import { GeneralTab } from "@/components/agents/tabs/GeneralTab"
import { InstructionsTab } from "@/components/agents/tabs/InstructionsTab"
import { DocumentsTab } from "@/components/agents/tabs/DocumentsTab"
import { WebhooksTab } from "@/components/agents/tabs/WebhooksTab"

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const search = useSearchParams()
  const id = params.id

  const [agent, setAgent] = useState<Agent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<"created" | "created-partial" | null>(() => {
    const f = search.get("flash")
    return f === "created" || f === "created-partial" ? f : null
  })

  // Limpa flash da URL após capturar
  useEffect(() => {
    if (!flash) return
    const next = new URLSearchParams(search.toString())
    next.delete("flash")
    router.replace(`/agentes/${id}${next.toString() ? `?${next}` : ""}`, { scroll: false })
    const t = setTimeout(() => setFlash(null), 5000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    getAgent(id)
      .then((a) => !cancelled && setAgent(a))
      .catch((e) => !cancelled && setError(String(e?.message ?? e)))
    return () => {
      cancelled = true
    }
  }, [id])

  const tab = tabFromParams(new URLSearchParams(search.toString()))

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-app">
        <div className="bg-bg-surface border border-default rounded-xl p-8 max-w-md text-center">
          <div className="text-subtitle text-text-primary">Agente não encontrado</div>
          <p className="text-body text-text-secondary mt-2">{error}</p>
          <button
            onClick={() => router.push("/agentes")}
            className="mt-comfortable inline-flex items-center gap-2 bg-bg-surface text-text-primary border border-default rounded-default px-4 py-2 text-body-strong hover:bg-bg-subtle hover:border-strong transition"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex-1 flex flex-col bg-bg-app">
        <header className="bg-bg-surface border-b border-default px-6 md:px-8 py-5 shrink-0">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-bg-muted animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-1/3 bg-bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-bg-muted rounded animate-pulse" />
            </div>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-app overflow-hidden">
      <BackBar />
      <AgentDetailHeader agent={agent} onChange={setAgent} />
      <AgentTabs agentId={agent.id} active={tab} />

      {flash && <FlashBanner kind={flash} onDismiss={() => setFlash(null)} />}

      {tab === "geral"      && <GeneralTab      agent={agent} onChange={setAgent} />}
      {tab === "instrucoes" && <InstructionsTab agent={agent} onChange={setAgent} />}
      {tab === "documentos" && <DocumentsTab    agent={agent} />}
      {tab === "webhooks"   && <WebhooksTab    agent={agent} />}
      {tab === "testar"     && <ComingSoon name="Testar" />}
    </div>
  )
}

function BackBar() {
  const router = useRouter()
  return (
    <div className="bg-bg-surface px-6 md:px-8 pt-3 shrink-0">
      <button
        onClick={() => router.push("/agentes")}
        className="inline-flex items-center gap-1 text-small text-text-tertiary hover:text-text-secondary transition"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Agentes
      </button>
    </div>
  )
}

function FlashBanner({
  kind,
  onDismiss,
}: {
  kind: "created" | "created-partial"
  onDismiss: () => void
}) {
  const ok = kind === "created"
  return (
    <div
      className={`shrink-0 ${ok ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} border-b border-default px-6 md:px-8 py-2.5`}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-2 text-small">
        {ok ? (
          <CheckCircle2 size={14} strokeWidth={1.5} />
        ) : (
          <AlertTriangle size={14} strokeWidth={1.5} />
        )}
        <span className="flex-1">
          {ok
            ? "Agente criado com sucesso."
            : "Agente criado, mas alguns itens falharam — confira nas abas."}
        </span>
        <button onClick={onDismiss} className="text-tiny opacity-70 hover:opacity-100">
          fechar
        </button>
      </div>
    </div>
  )
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-loose">
      <div className="max-w-3xl mx-auto bg-bg-surface border border-default rounded-xl p-loose text-center">
        <p className="text-body text-text-tertiary">
          Aba <strong>{name}</strong> — em construção.
        </p>
      </div>
    </div>
  )
}
