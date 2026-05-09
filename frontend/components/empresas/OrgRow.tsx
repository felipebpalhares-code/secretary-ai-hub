"use client"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import type { Organization } from "@/lib/contacts-types"

function formatCnpj(d: string | null): string | null {
  if (!d) return null
  const s = d.replace(/\D/g, "")
  if (s.length !== 14) return d
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`
}

function relativeFromIso(iso: string | null): string | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 0) return null
  const d = Math.floor(ms / 86_400_000)
  if (d === 0) return "hoje"
  if (d === 1) return "1d"
  if (d < 30) return `${d}d`
  const m = Math.round(d / 30)
  return m === 1 ? "1mês" : `${m}m`
}

export function OrgRow({
  org,
  onClick,
}: {
  org: Organization
  onClick: () => void
}) {
  const cnpj = formatCnpj(org.cnpj)
  const enriched = relativeFromIso(org.enriched_at)
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "text-left w-full grid grid-cols-[1.5fr_140px_1.4fr_90px_70px] items-center gap-3",
        "px-3 py-2 border-b border-hair-2 hover:bg-bg-subtle transition-colors"
      )}
    >
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink truncate">{org.name}</div>
        {org.trade_name && org.trade_name !== org.name && (
          <div className="text-[10.5px] text-ink-3 font-medium truncate">{org.trade_name}</div>
        )}
      </div>
      <div className="text-[11.5px] text-ink-2 font-medium truncate mono">
        {cnpj ?? <span className="text-ink-3">—</span>}
      </div>
      <div className="text-[11.5px] text-ink-2 font-medium truncate">
        {org.industry ?? <span className="text-ink-3">—</span>}
      </div>
      <div className="text-[11px] text-ink-3 font-medium tabular-nums">
        {enriched ? `↻ ${enriched}` : <span className="text-ink-3">nunca</span>}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-ink-3">
        <Icon name="users" size={12} />
        <span className="text-[11.5px] font-semibold tabular-nums text-ink-2">
          {org.contact_count}
        </span>
      </div>
    </button>
  )
}
