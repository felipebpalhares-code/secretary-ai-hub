import { TopBar, Button } from "@/components/TopBar"
import { FinancasHub } from "./FinancasHub"

export default function FinancasPage() {
  return (
    <>
      <TopBar
        title="Finanças"
        subtitle="Centros de custo, obras e patrimônio"
        actions={
          <>
            <Button icon="settings" disabled title="Em breve">
              Sincronizar
            </Button>
            <Button
              variant="primary"
              icon="plus"
              disabled
              title="Em breve · cadastro de lançamentos pendente"
            >
              Novo lançamento
            </Button>
          </>
        }
      />
      <FinancasHub />
    </>
  )
}
