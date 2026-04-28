"use client"
import { Icon } from "@/components/Icon"
import { EmptyState } from "@/components/ui/EmptyState"

/**
 * Sem backend de agentes ainda — esta tela mostra empty state honesto.
 * Quando a API de agentes for implementada (CrewAI/LangGraph + persistência
 * de definições e treinamento), troca o vazio por fetch real.
 */
export function AgentsHub() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 bg-bg-app">
      {/* KPIs zerados — estrutura mantida pra quando virar dinâmico */}
      <div className="grid grid-cols-4 gap-3">
        <Kpi icon="bot" value={0} label="Agentes" />
        <Kpi icon="check" value={0} label="Online" />
        <Kpi icon="alert" value={0} label="Alertas" />
        <Kpi icon="file" value={0} label="Docs" />
      </div>

      <div className="bg-bg-surface border border-default rounded-xl">
        <EmptyState
          icon="bot"
          title="Nenhum agente configurado ainda"
          subtitle={
            <>
              Quando os agentes IA forem cadastrados (Dr. jurídico, CFO, gestor de
              obras, e-mails…), eles aparecem aqui com nível de treinamento, status e
              alertas. Ainda não está disponível pra cadastro.
            </>
          }
        />
      </div>
    </div>
  )
}

function Kpi({
  icon,
  value,
  label,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  value: number
  label: string
}) {
  return (
    <div className="bg-bg-surface border border-default rounded-lg p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-bg-subtle border border-default flex items-center justify-center text-text-secondary shrink-0">
        <Icon name={icon} size={16} />
      </div>
      <div>
        <div className="text-title text-text-primary leading-none tabular-nums">{value}</div>
        <div className="text-tiny text-text-tertiary font-medium mt-1 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  )
}
