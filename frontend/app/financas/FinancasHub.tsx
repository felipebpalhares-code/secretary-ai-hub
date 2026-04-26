"use client"
import { useState } from "react"
import { TreePanel } from "@/components/financas/TreePanel"
import { ObraDetail } from "@/components/financas/ObraDetail"
import { ConsolidadoView, CCView, CartaView } from "@/components/financas/EntityViews"

const PARENT: Record<string, string> = {
  moradia: "Felipe PF",
  familia: "Felipe PF",
  saude: "Felipe PF",
  lazer: "Felipe PF",
  invest: "Felipe PF",
  dev: "PalharesTech",
  mkt: "PalharesTech",
  "vendas-pt": "PalharesTech",
  "admin-pt": "PalharesTech",
  infra: "PalharesTech",
  logistica: "Distribuidora Braz",
  armazem: "Distribuidora Braz",
  "vendas-br": "Distribuidora Braz",
}

const CC_LABEL: Record<string, string> = {
  moradia: "Moradia",
  familia: "Família",
  saude: "Saúde",
  lazer: "Lazer",
  invest: "Investimentos",
  dev: "Dev",
  mkt: "Marketing",
  "vendas-pt": "Vendas",
  "admin-pt": "Admin",
  infra: "Infra / Cloud",
  logistica: "Logística",
  armazem: "Armazém",
  "vendas-br": "Vendas",
}

const CARTAS: Record<string, { name: string; status: "ativa" | "lance" | "contemplada" }> = {
  porto: { name: "Porto Seguro #8472", status: "lance" },
  bb: { name: "BB Consórcio #1023", status: "contemplada" },
  itau: { name: "Itaú Imóveis #5501", status: "ativa" },
  bradesco: { name: "Bradesco Veículos #332", status: "ativa" },
}

export function FinancasHub() {
  const [activeId, setActiveId] = useState("obra-a")

  return (
    <div className="flex-1 flex overflow-hidden min-w-0">
      <TreePanel activeId={activeId} onSelect={setActiveId} />
      {renderView(activeId)}
    </div>
  )
}

function renderView(activeId: string) {
  // Vista consolidada
  if (activeId === "consolidado") return <ConsolidadoView />

  // Centros de custo
  if (CC_LABEL[activeId]) {
    return <CCView name={CC_LABEL[activeId]} parent={PARENT[activeId] ?? ""} />
  }

  // Cartas de crédito
  if (CARTAS[activeId]) {
    return <CartaView name={CARTAS[activeId].name} status={CARTAS[activeId].status} />
  }

  // Default: detalhe de obra (Bloco A) — única vista detalhada existente
  return <ObraDetail />
}
