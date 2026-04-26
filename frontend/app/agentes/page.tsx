import { TopBar, IconButton, Button } from "@/components/TopBar"
import { AgentsHub } from "./AgentsHub"

export default function AgentesPage() {
  return (
    <>
      <TopBar
        title="Agentes"
        subtitle="Equipe de 8 especialistas"
        actions={
          <>
            <IconButton name="bell" dot />
            <Button variant="primary" icon="plus">
              Novo agente
            </Button>
          </>
        }
      />
      <AgentsHub />
    </>
  )
}
