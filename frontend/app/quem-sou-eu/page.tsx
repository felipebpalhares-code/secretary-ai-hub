import { TopBar, IconButton, Button } from "@/components/TopBar"
import { ProfileBanner } from "@/components/ProfileBanner"
import { ProfileTabs } from "./ProfileTabs"

export default function QuemSouEuPage() {
  return (
    <>
      <TopBar
        title="Quem Sou Eu"
        subtitle="Perfil pessoal e empresarial"
        actions={
          <>
            <IconButton name="search" />
            <Button variant="primary" icon="edit">
              Editar perfil
            </Button>
          </>
        }
      />

      <ProfileBanner
        initials="F"
        name="Felipe Braz Palhares"
        role="Empresário · Curitiba, Paraná"
        tags={["CEO PalharesTech", "Sócio Distribuidora Braz", "Holding Vimar"]}
        stats={[
          { value: 3, label: "Empresas" },
          { value: 2, label: "Processos" },
          { value: 5, label: "Imóveis" },
          { value: 7, label: "Metas 2026" },
        ]}
      />

      <ProfileTabs />
    </>
  )
}
