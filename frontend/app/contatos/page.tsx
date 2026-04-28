import { TopBar, IconButton, Button } from "@/components/TopBar"
import { ContatosHub } from "./ContatosHub"

export default function ContatosPage() {
  return (
    <>
      <TopBar
        title="Contatos"
        subtitle="Sua rede de contatos"
        actions={
          <>
            <IconButton name="search" disabled title="Em breve" />
            <Button icon="plus" disabled title="Em breve">
              Importar
            </Button>
            <Button icon="settings" disabled title="Integração Google ainda não disponível">
              Sync Google
            </Button>
            <Button
              variant="primary"
              icon="plus"
              disabled
              title="Em breve · cadastro de contatos pendente"
            >
              Novo contato
            </Button>
          </>
        }
      />
      <ContatosHub />
    </>
  )
}
