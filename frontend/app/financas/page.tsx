import { TopBar, Button } from "@/components/TopBar"
import { FinancasHub } from "./FinancasHub"
import { DisabledFeaturePage } from "@/components/auth/FeatureGate"

export default function FinancasPage() {
  return (
    <DisabledFeaturePage
      feature="financas"
      title="Finanças"
      reason="Dashboard vai derivar de transações Pluggy + classificação por agente. Hoje exibe apenas dados de exemplo."
    >
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
    </DisabledFeaturePage>
  )
}
