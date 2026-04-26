"use client"
import { useState } from "react"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import { BalanceHero } from "@/components/banks/BalanceHero"
import { EntityCard } from "@/components/banks/EntityCard"
import { AccountList } from "@/components/banks/AccountList"
import { Extrato } from "@/components/banks/Extrato"
import { CreditCards } from "@/components/banks/CreditCards"
import { Pix } from "@/components/banks/Pix"
import { Boletos } from "@/components/banks/Boletos"
import { Tributos } from "@/components/banks/Tributos"
import { Analise } from "@/components/banks/Analise"
import { ENTITIES, type Entity } from "@/lib/banks-data"

const TABS = [
  { id: "geral", label: "Visão Geral", icon: "grid" as const },
  { id: "extrato", label: "Extrato", icon: "chart" as const },
  { id: "cartoes", label: "Cartões", icon: "card" as const },
  { id: "pix", label: "PIX & Operações", icon: "send" as const },
  { id: "boletos", label: "Boletos", icon: "file" as const },
  { id: "tributos", label: "Tributos", icon: "shield" as const },
  { id: "analise", label: "Análise", icon: "target" as const },
]

export function BancosHub() {
  const [tab, setTab] = useState("geral")
  const [activeEntity, setActiveEntity] = useState<Entity | null>(null)

  return (
    <>
      <div className="bg-card border-b border-hair flex overflow-x-auto px-5 shrink-0 scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => !t.soon && setTab(t.id)}
            disabled={t.soon}
            className={cn(
              "px-[14px] py-3 text-[12.5px] font-semibold whitespace-nowrap flex items-center gap-[6px] tracking-[-.1px] transition-colors border-b-2",
              tab === t.id
                ? "text-accent border-accent"
                : t.soon
                  ? "text-ink-4 border-transparent cursor-not-allowed"
                  : "text-ink-3 border-transparent hover:text-ink-2"
            )}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
            {t.soon && (
              <span className="text-[9px] font-bold bg-hair-2 text-ink-3 border border-hair px-[5px] py-px rounded ml-1 uppercase tracking-[.04em]">
                em breve
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {tab === "geral" && (
          <>
            <BalanceHero />
            <div>
              <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
                Por entidade
              </div>
              <div className="grid grid-cols-4 gap-3">
                {ENTITIES.map((entity) => (
                  <EntityCard
                    key={entity.id}
                    entity={entity}
                    active={activeEntity === entity.id}
                    onClick={() =>
                      setActiveEntity((prev) => (prev === entity.id ? null : entity.id))
                    }
                  />
                ))}
              </div>
            </div>
            <AccountList />
          </>
        )}

        {tab === "extrato" && <Extrato />}
        {tab === "cartoes" && <CreditCards />}
        {tab === "pix" && <Pix />}
        {tab === "boletos" && <Boletos />}
        {tab === "tributos" && <Tributos />}
        {tab === "analise" && <Analise />}
      </div>
    </>
  )
}
