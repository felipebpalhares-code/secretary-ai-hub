import { TopBar, IconButton, Button } from "@/components/TopBar"
import { ContatosHub } from "./ContatosHub"

export default function ContatosPage() {
  return (
    <>
      <TopBar
        title="Contatos"
        subtitle="247 contatos na rede"
        actions={
          <>
            <IconButton name="search" />
            <Button icon="plus">Importar</Button>
            <Button icon="settings">Sync Google</Button>
            <Button variant="primary" icon="plus">
              Novo contato
            </Button>
          </>
        }
      />
      <ContatosHub />
    </>
  )
}
