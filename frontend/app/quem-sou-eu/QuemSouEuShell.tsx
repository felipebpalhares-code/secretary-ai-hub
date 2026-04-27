"use client"
import { useCallback, useEffect, useState } from "react"
import { TopBar, IconButton, Button } from "@/components/TopBar"
import { ProfileBanner } from "@/components/ProfileBanner"
import { IdentityProvider, useIdentity } from "@/components/profile/identity-context"
import { EditIdentityModal } from "@/components/profile/EditIdentityModal"
import { getBannerStats, type BannerStats } from "@/lib/api"
import { ProfileTabs } from "./ProfileTabs"

const ZERO_STATS: BannerStats = {
  companies: 0,
  legal_cases_active: 0,
  real_estate: 0,
  goals_open: 0,
  legal_deadline_soon: false,
}

function ShellInner() {
  const { openEdit, identity } = useIdentity()
  const [stats, setStats] = useState<BannerStats>(ZERO_STATS)

  const reload = useCallback(async () => {
    try {
      setStats(await getBannerStats())
    } catch {
      setStats(ZERO_STATS)
    }
  }, [])

  useEffect(() => {
    void reload()
    // recarrega ao voltar pra aba (após salvar em modais)
    const onFocus = () => void reload()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [reload])

  const displayName = identity?.full_name || "Perfil sem dados"
  const initials = (identity?.full_name?.trim()?.charAt(0) || "?").toUpperCase()
  const role =
    stats.companies > 0
      ? identity?.birthplace
        ? `Empresário · ${identity.birthplace}`
        : "Empresário"
      : "Cadastre seu perfil"

  return (
    <>
      <TopBar
        title="Quem Sou Eu"
        subtitle="Perfil pessoal e empresarial"
        actions={
          <>
            <IconButton name="search" />
            <Button variant="primary" icon="edit" onClick={openEdit}>
              Editar perfil
            </Button>
          </>
        }
      />

      <ProfileBanner
        initials={initials}
        name={displayName}
        role={role}
        stats={[
          { value: stats.companies, label: "Empresas" },
          { value: stats.legal_cases_active, label: "Processos" },
          { value: stats.real_estate, label: "Imóveis" },
          { value: stats.goals_open, label: `Metas ${new Date().getFullYear()}` },
        ]}
      />

      <ProfileTabs legalDeadlineSoon={stats.legal_deadline_soon} />
      <EditIdentityModal />
    </>
  )
}

export function QuemSouEuShell() {
  return (
    <IdentityProvider>
      <ShellInner />
    </IdentityProvider>
  )
}
