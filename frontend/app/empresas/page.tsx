import { TopBar } from "@/components/TopBar"
import { EmpresasHub } from "./EmpresasHub"

export default function EmpresasPage() {
  return (
    <>
      <TopBar
        title="Empresas"
        subtitle="Catálogo de organizações vinculadas aos contatos"
      />
      <EmpresasHub />
    </>
  )
}
