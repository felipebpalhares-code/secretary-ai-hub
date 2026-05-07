"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TopBar, IconButton, Button } from "@/components/TopBar"
import { SectionTitle } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { Icon } from "@/components/Icon"
import { listAgents } from "@/lib/agents-api"
import { banksConnections } from "@/lib/api"

type KpiNumeric = { state: "loading" } | { state: "ready"; value: number } | { state: "error" }

const NA_TOOLTIP = {
  contacts: "Cadastro genérico de contatos ainda não implementado",
  email: "Gmail não conectado",
  events: "Google Calendar não conectado",
  documents: "Repositório genérico de documentos ainda não implementado",
}

function renderValue(kpi: KpiNumeric): string | number {
  if (kpi.state === "ready") return kpi.value
  if (kpi.state === "loading") return "…"
  return "—"
}

export default function PainelPage() {
  const router = useRouter()
  const [agentsActive, setAgentsActive] = useState<KpiNumeric>({ state: "loading" })
  const [banksConnected, setBanksConnected] = useState<KpiNumeric>({ state: "loading" })

  useEffect(() => {
    let mounted = true
    listAgents()
      .then((agents) => {
        if (!mounted) return
        const active = agents.filter((a) => a.status === "active").length
        setAgentsActive({ state: "ready", value: active })
      })
      .catch(() => mounted && setAgentsActive({ state: "error" }))
    banksConnections()
      .then((conn) => {
        if (!mounted) return
        setBanksConnected({ state: "ready", value: conn.length })
      })
      .catch(() => mounted && setBanksConnected({ state: "error" }))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      <TopBar
        title="Painel"
        subtitle="Visão geral da operação"
        actions={
          <>
            <IconButton name="search" disabled title="Em breve" />
            <IconButton name="bell" disabled title="Em breve" />
            <Button
              variant="primary"
              icon="plus"
              onClick={() => router.push("/tarefas")}
              title="Abrir Tarefas"
            >
              Nova tarefa
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-[22px]">
        <div>
          <SectionTitle>Visão geral</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon="bot"
              value={renderValue(agentsActive)}
              label="Agentes ativos"
              meta="Configure em /agentes"
              tooltip={
                agentsActive.state === "error"
                  ? "Falha ao carregar /api/agents"
                  : agentsActive.state === "ready" && agentsActive.value === 0
                    ? "Nenhum agente com status 'active'"
                    : undefined
              }
            />
            <StatCard
              icon="users"
              value="—"
              label="Contatos"
              meta="Adicione em /contatos"
              tooltip={NA_TOOLTIP.contacts}
            />
            <StatCard
              icon="mail"
              value="—"
              label="E-mails não lidos"
              meta="Conecte sua caixa"
              tooltip={NA_TOOLTIP.email}
            />
            <StatCard
              icon="calendar"
              value="—"
              label="Eventos hoje"
              meta="Configure em /agenda"
              tooltip={NA_TOOLTIP.events}
            />
            <StatCard
              icon="file"
              value="—"
              label="Documentos"
              meta="Suba em /documentos"
              tooltip={NA_TOOLTIP.documents}
            />
            <StatCard
              icon="bank"
              value={renderValue(banksConnected)}
              label="Bancos conectados"
              meta="Conecte em /bancos"
              tooltip={
                banksConnected.state === "error"
                  ? "Falha ao carregar /api/banks/connections"
                  : banksConnected.state === "ready" && banksConnected.value === 0
                    ? "Nenhuma conexão bancária ativa"
                    : undefined
              }
            />
          </div>
        </div>

        <div>
          <SectionTitle>Atenção necessária</SectionTitle>
          <div className="bg-card border border-hair rounded-lg p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-bg border border-hair flex items-center justify-center text-ink-3 mx-auto mb-3">
              <Icon name="check" size={20} />
            </div>
            <div className="text-[13px] font-bold text-ink mb-1">Nada pendente por enquanto</div>
            <div className="text-[11.5px] text-ink-3 font-medium max-w-md mx-auto">
              Conforme você configurar agentes, conectar bancos e cadastrar contatos, alertas relevantes vão aparecer aqui automaticamente.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
