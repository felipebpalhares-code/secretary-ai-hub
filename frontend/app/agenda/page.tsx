import { TopBar, IconButton, Button } from "@/components/TopBar"
import { AgendaHub } from "./AgendaHub"

export default function AgendaPage() {
  return (
    <>
      <TopBar
        title="Agenda"
        subtitle="Sexta, 24 de abril · 4 eventos hoje"
        actions={
          <>
            <IconButton name="search" />
            <Button icon="plus">Importar</Button>
            <Button variant="primary" icon="plus">
              Novo evento
            </Button>
          </>
        }
      />
      <AgendaHub />
    </>
  )
}
