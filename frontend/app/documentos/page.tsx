import { TopBar, IconButton, Button } from "@/components/TopBar"
import { DocsHub } from "./DocsHub"

export default function DocumentosPage() {
  return (
    <>
      <TopBar
        title="Documentos"
        subtitle="OCR ativo · classificação automática"
        actions={
          <>
            <IconButton name="search" disabled title="Em breve" />
            <Button
              variant="primary"
              icon="plus"
              disabled
              title="Em breve · upload genérico pendente (CNH/RG/passaporte ficam em /quem-sou-eu)"
            >
              Enviar documento
            </Button>
          </>
        }
      />
      <DocsHub />
    </>
  )
}
