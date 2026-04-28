import { TopBar, IconButton, Button } from "@/components/TopBar"
import { AgendaHub } from "./AgendaHub"

export default function AgendaPage() {
  return (
    <>
      <TopBar
        title="Agenda"
        subtitle="Sua semana"
        actions={
          <>
            <IconButton name="search" disabled title="Em breve" />
            <Button icon="plus" disabled title="Em breve">
              Importar
            </Button>
            <Button
              variant="primary"
              icon="plus"
              disabled
              title="Em breve · cadastro de eventos pendente"
            >
              Novo evento
            </Button>
          </>
        }
      />
      <AgendaHub />
    </>
  )
}
