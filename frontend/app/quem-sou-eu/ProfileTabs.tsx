"use client"
import { Tabs } from "@/components/ui/Tabs"
import {
  IdentidadeTab,
  EmpresarialTab,
  FamiliaTab,
  FinanceiroTab,
  JuridicoTab,
  AcessosTab,
  ObjetivosTab,
} from "@/components/profile/tabs"

export function ProfileTabs({ legalDeadlineSoon = false }: { legalDeadlineSoon?: boolean }) {
  const tabs = [
    { id: "identidade", label: "Identidade", icon: "user" as const },
    { id: "empresarial", label: "Empresarial", icon: "building" as const },
    { id: "familia", label: "Família", icon: "users" as const },
    { id: "financeiro", label: "Financeiro", icon: "money" as const },
    { id: "juridico", label: "Jurídico", icon: "shield" as const, notif: legalDeadlineSoon },
    { id: "acessos", label: "Acessos", icon: "lock" as const },
    { id: "objetivos", label: "Objetivos", icon: "target" as const },
  ]

  return (
    <Tabs tabs={tabs} defaultActive="identidade">
      {(active) => (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {active === "identidade" && <IdentidadeTab />}
          {active === "empresarial" && <EmpresarialTab />}
          {active === "familia" && <FamiliaTab />}
          {active === "financeiro" && <FinanceiroTab />}
          {active === "juridico" && <JuridicoTab />}
          {active === "acessos" && <AcessosTab />}
          {active === "objetivos" && <ObjetivosTab />}
        </div>
      )}
    </Tabs>
  )
}
