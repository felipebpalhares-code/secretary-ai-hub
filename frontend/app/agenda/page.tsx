import { TopBar, IconButton, Button } from "@/components/TopBar"
import { AgendaHub } from "./AgendaHub"
import { PermissionGate } from "@/components/auth/PermissionGate"

export default function AgendaPage() {
  return (
    <>
      <TopBar
        title="Agenda"
        subtitle="Sua semana"
        actions={
          <>
            <IconButton name="search" disabled title="Em breve" />
            <PermissionGate module="agenda" action="criar">
              <Button icon="plus" disabled title="Em breve">
                Importar
              </Button>
            </PermissionGate>
            <PermissionGate module="agenda" action="criar">
              <Button
                variant="primary"
                icon="plus"
                disabled
                title="Em breve · cadastro de eventos pendente"
              >
                Novo evento
              </Button>
            </PermissionGate>
          </>
        }
      />
      <AgendaHub />
    </>
  )
}
