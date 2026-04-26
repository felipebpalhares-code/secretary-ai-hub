"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import {
  ACCOUNTS,
  ENTITIES,
  BANK_COLORS,
  fmtBRL,
  type Entity,
  type BankAccount,
} from "@/lib/banks-data"

const TYPE_LABEL = {
  corrente: "Conta Corrente",
  poupanca: "Poupança",
  investimento: "Investimentos",
  digital: "Digital",
}

const ENTITY_TONE = {
  pf: "bg-accent-soft text-accent border-indigo-200",
  palharestech: "bg-emerald-50 text-emerald-700 border-emerald-200",
  braz: "bg-amber-50 text-amber-700 border-amber-200",
  vimar: "bg-orange-50 text-orange-700 border-orange-200",
}

export function AccountList() {
  const [filter, setFilter] = useState<"all" | Entity>("all")

  const filtered = filter === "all" ? ACCOUNTS : ACCOUNTS.filter((a) => a.entity === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-[10px]">
        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
          Contas conectadas ({filtered.length})
        </div>
        <div className="flex gap-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Todas
          </FilterChip>
          {ENTITIES.map((e) => (
            <FilterChip
              key={e.id}
              active={filter === e.id}
              onClick={() => setFilter(e.id)}
            >
              {e.short}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="bg-card border border-hair rounded-lg overflow-hidden">
        {filtered.map((account, i) => (
          <AccountRow key={account.id} account={account} last={i === filtered.length - 1} />
        ))}
      </div>
    </div>
  )
}

function AccountRow({ account, last }: { account: BankAccount; last: boolean }) {
  const entityInfo = ENTITIES.find((e) => e.id === account.entity)!

  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_120px_140px_120px_44px] items-center gap-3 px-4 py-3 hover:bg-bg cursor-pointer transition-colors",
        !last && "border-b border-hair-2"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-md flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0",
          BANK_COLORS[account.bank]
        )}
      >
        {account.bankLabel.slice(0, 3)}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-bold text-ink tracking-[-.15px] truncate">
            {account.bankLabel}
          </div>
          {account.primary && (
            <span className="text-[9px] font-bold text-accent bg-accent-soft border border-indigo-200 px-[5px] py-px rounded">
              PRINCIPAL
            </span>
          )}
        </div>
        <div className="text-[11px] text-ink-3 font-medium mono mt-px">
          {account.agency && `Ag. ${account.agency} · `}
          {TYPE_LABEL[account.type]} {account.account}
        </div>
      </div>

      <div>
        <span
          className={cn(
            "text-[10px] font-bold px-[7px] py-[2px] rounded border tracking-[.02em]",
            ENTITY_TONE[account.entity]
          )}
        >
          {entityInfo.short}
        </span>
      </div>

      <div className="text-right">
        <div className="text-[14px] font-bold text-ink mono tabular tracking-[-.2px]">
          {fmtBRL(account.balance)}
        </div>
        <div
          className={cn(
            "text-[11px] font-semibold mt-px",
            account.variation > 0 ? "text-ok" : account.variation < 0 ? "text-err" : "text-ink-3"
          )}
        >
          {account.variation > 0 ? "+" : ""}
          {account.variation.toFixed(1)}%
        </div>
      </div>

      <div className="flex flex-col items-start gap-px">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-bold px-[6px] py-px rounded border",
            account.syncStatus === "ok"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : account.syncStatus === "syncing"
                ? "bg-accent-soft text-accent border-indigo-200"
                : "bg-red-50 text-err border-red-200"
          )}
        >
          {account.syncStatus === "ok" ? "● Sync" : account.syncStatus === "syncing" ? "↻ Sync..." : "● Erro"}
        </span>
        <span className="text-[10px] text-ink-3 font-medium">{account.lastSync}</span>
      </div>

      <button className="w-9 h-9 rounded-md border border-hair text-ink-3 hover:border-accent hover:text-accent flex items-center justify-center transition-colors">
        <Icon name="chevron" size={13} />
      </button>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-[11px] py-[3px] rounded-full border text-[11px] font-semibold transition-colors",
        active
          ? "bg-accent-soft border-indigo-200 text-accent"
          : "bg-card border-hair text-ink-2 hover:border-ink-4"
      )}
    >
      {children}
    </button>
  )
}
