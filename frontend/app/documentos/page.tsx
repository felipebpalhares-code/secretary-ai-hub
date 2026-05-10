import { TopBar, IconButton, Button } from "@/components/TopBar"
import { DocsHub } from "./DocsHub"
import { DisabledFeaturePage } from "@/components/auth/FeatureGate"

export default function DocumentosPage() {
  return (
    <DisabledFeaturePage
      feature="documentos"
      title="Documentos"
      reason="Repositório de documentos vai usar Google Drive (OAuth pronto) ou bucket S3. Hoje exibe apenas amostras."
    >
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
    </DisabledFeaturePage>
  )
}
