"use client"
import { TopBar, IconButton, Button } from "@/components/TopBar"
import { AgentsHub } from "./AgentsHub"

/**
 * Subtitle dinâmica baseada em count real de agentes.
 * Quando a API de agentes for criada, basta substituir `agentCount` por
 * fetch real (useAgents/listAgents).
 */
export default function AgentesPage() {
  const agentCount = 0  // TODO: trocar por count real quando houver API

  const subtitle =
    agentCount === 0
      ? "Configure seus especialistas IA"
      : agentCount === 1
        ? "1 especialista configurado"
        : `${agentCount} especialistas configurados`

  return (
    <>
      <TopBar
        title="Agentes"
        subtitle={subtitle}
        actions={
          <>
            <IconButton name="bell" disabled title="Em breve" />
            <Button
              variant="primary"
              icon="plus"
              disabled
              title="Em breve · cadastro de agentes ainda não disponível"
            >
              Novo agente
            </Button>
          </>
        }
      />
      <AgentsHub />
    </>
  )
}
