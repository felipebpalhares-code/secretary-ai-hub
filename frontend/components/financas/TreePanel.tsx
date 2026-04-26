"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import {
  TREE,
  TREE_PF,
  TREE_EMPRESAS,
  TREE_VIMAR,
  TREE_CARTAS,
  type TreeNode,
  type EntityBadge,
} from "@/lib/financas-data"

const BADGE_CLS: Record<EntityBadge, string> = {
  pf: "bg-accent-soft text-accent border-indigo-200",
  pj: "bg-emerald-50 text-emerald-700 border-emerald-200",
  hold: "bg-amber-50 text-amber-700 border-amber-200",
  obra: "bg-orange-50 text-orange-700 border-orange-200",
  cc: "bg-hair-2 text-ink-3 border-hair",
  carta: "bg-purple-50 text-purple-700 border-purple-200",
  contemp: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lance: "bg-amber-50 text-amber-700 border-amber-200",
}

const BADGE_LABEL: Record<EntityBadge, string> = {
  pf: "PF",
  pj: "PJ",
  hold: "HOLD",
  obra: "OBRA",
  cc: "CC",
  carta: "ATIVA",
  contemp: "CONT",
  lance: "LANCE",
}

export function TreePanel({
  activeId,
  onSelect,
}: {
  activeId: string
  onSelect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "felipe-pf": true,
    palharestech: true,
    vimar: true,
    cartas: true,
  })

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }))

  const renderNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expanded[node.id]
    const isActive = activeId === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id}>
        <div
          onClick={() => {
            if (hasChildren) toggle(node.id)
            else onSelect(node.id)
          }}
          className={cn(
            "flex items-center gap-[6px] px-2 py-[6px] rounded cursor-pointer text-[12.5px] transition-colors mb-px",
            isActive
              ? "bg-accent-soft text-accent font-semibold"
              : "text-ink-2 font-medium hover:bg-bg"
          )}
        >
          <span
            className={cn(
              "w-3 text-[10px] text-ink-3 shrink-0 text-center transition-transform",
              isExpanded && "rotate-90"
            )}
          >
            {hasChildren ? "▸" : "·"}
          </span>
          <span className="w-4 text-[12px] text-center shrink-0">{node.icon ?? "●"}</span>
          <span className="flex-1 truncate">{node.label}</span>
          {node.badge && (
            <span
              className={cn(
                "text-[9px] font-bold px-[5px] py-[1px] rounded uppercase tracking-[.03em] border",
                BADGE_CLS[node.badge]
              )}
            >
              {BADGE_LABEL[node.badge]}
            </span>
          )}
          {node.meta && <span className="text-[10.5px] text-ink-3 font-semibold">{node.meta}</span>}
        </div>
        {hasChildren && isExpanded && (
          <div className="pl-[18px] ml-[5px] border-l border-dashed border-hair">
            {node.children!.map((c) => renderNode(c, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-2 mb-[4px] px-[10px] text-[10px] font-bold text-ink-3 uppercase tracking-[.06em]">
      {children}
    </div>
  )

  const AddBtn = ({ label }: { label: string }) => (
    <div className="text-accent font-medium text-[11.5px] px-2 py-[6px] rounded cursor-pointer flex items-center gap-[5px] border border-dashed border-transparent hover:bg-accent-soft hover:border-indigo-200 transition-colors">
      <Icon name="plus" size={11} />
      {label}
    </div>
  )

  return (
    <div className="w-[284px] min-w-[284px] bg-card border-r border-hair flex flex-col overflow-hidden shrink-0">
      <div className="px-[14px] pt-[14px] pb-[10px] border-b border-hair shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-bold text-ink tracking-[-.2px]">Estrutura</div>
          <button className="inline-flex items-center gap-[4px] px-[10px] py-1 bg-accent text-white text-[11px] font-semibold rounded-md hover:bg-accent-hover transition-colors">
            <Icon name="plus" size={11} />
            Entidade
          </button>
        </div>
        <div className="flex items-center gap-[6px] bg-bg border border-hair rounded-md px-[10px] py-[6px] focus-within:border-accent focus-within:bg-card">
          <Icon name="search" size={13} className="text-ink-3" />
          <input
            placeholder="Buscar entidade, CC..."
            className="flex-1 bg-transparent outline-none text-[12px] text-ink placeholder:text-ink-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <SectionLabel>Consolidado</SectionLabel>
        {TREE.map((n) => renderNode(n))}

        <SectionLabel>Pessoa Física</SectionLabel>
        {TREE_PF.map((n) => renderNode(n))}

        <SectionLabel>Empresas</SectionLabel>
        {TREE_EMPRESAS.map((n) => renderNode(n))}
        <AddBtn label="nova empresa" />

        <SectionLabel>Holding de Obras</SectionLabel>
        {TREE_VIMAR.map((n) => renderNode(n))}

        <SectionLabel>Cartas de Crédito</SectionLabel>
        {TREE_CARTAS.map((n) => renderNode(n))}
      </div>
    </div>
  )
}
