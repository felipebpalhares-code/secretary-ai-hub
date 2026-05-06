"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TopBar, Button } from "@/components/TopBar"
import { listAgents } from "@/lib/agents-api"
import { AgentsHub } from "./AgentsHub"

export default function AgentesPage() {
  const router = useRouter()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    listAgents()
      .then((list) => setCount(list.length))
      .catch(() => setCount(0))
  }, [])

  const subtitle =
    count === null
      ? "Carregando especialistas…"
      : count === 0
        ? "Configure seus especialistas IA"
        : count === 1
          ? "1 especialista configurado"
          : `${count} especialistas configurados`

  return (
    <>
      <TopBar
        title="Agentes"
        subtitle={subtitle}
        actions={
          <Button variant="primary" icon="plus" onClick={() => router.push("/agentes/novo")}>
            Novo agente
          </Button>
        }
      />
      <AgentsHub />
    </>
  )
}
