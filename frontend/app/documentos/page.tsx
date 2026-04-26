import { TopBar, IconButton, Button } from "@/components/TopBar"
import { DocsHub } from "./DocsHub"

export default function DocumentosPage() {
  return (
    <>
      <TopBar
        title="Documentos"
        subtitle="87 arquivos · OCR ativo"
        actions={
          <>
            <IconButton name="search" />
            <Button variant="primary" icon="plus">
              Enviar documento
            </Button>
          </>
        }
      />
      <DocsHub />
    </>
  )
}
