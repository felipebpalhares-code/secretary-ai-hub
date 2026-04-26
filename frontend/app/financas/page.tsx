import { TopBar, Button } from "@/components/TopBar"
import { FinancasHub } from "./FinancasHub"

export default function FinancasPage() {
  return (
    <>
      <TopBar
        title="Finanças"
        subtitle="Controles paralelos · Entidades + Cartas de crédito"
        actions={
          <>
            <Button icon="settings">Sincronizar</Button>
            <Button variant="primary" icon="plus">
              Novo lançamento
            </Button>
          </>
        }
      />
      <FinancasHub />
    </>
  )
}
