import { TopBar, Button } from "@/components/TopBar"
import { ContatosHub } from "./ContatosHub"

export default function ContatosPage() {
  return (
    <>
      <TopBar
        title="Contatos"
        subtitle="Sua rede de contatos"
        actions={
          <>
            <Button icon="plus" disabled title="Em breve · CSV">
              Importar
            </Button>
            <Button
              icon="settings"
              disabled
              title="Em breve · sincronização com Google Contacts"
            >
              Sync Google
            </Button>
          </>
        }
      />
      <ContatosHub />
    </>
  )
}
