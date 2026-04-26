import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { entityTotal, ACCOUNTS, fmtCompact, type EntityInfo } from "@/lib/banks-data"

const TONE_BORDER = {
  indigo: "border-l-accent",
  ok: "border-l-ok",
  warn: "border-l-warn",
  amber: "border-l-amber-500",
}

const TONE_AV = {
  indigo: "bg-accent",
  ok: "bg-ok",
  warn: "bg-warn",
  amber: "bg-amber-500",
}

export function EntityCard({
  entity,
  active,
  onClick,
}: {
  entity: EntityInfo
  active?: boolean
  onClick?: () => void
}) {
  const total = entityTotal(entity.id)
  const accountCount = ACCOUNTS.filter((a) => a.entity === entity.id).length
  // mock: variação ponderada — só pra display
  const accs = ACCOUNTS.filter((a) => a.entity === entity.id)
  const avgVar = accs.reduce((s, a) => s + a.variation, 0) / accs.length

  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg p-4 flex flex-col gap-3 text-left transition-all border-l-[3px]",
        TONE_BORDER[entity.tone],
        active
          ? "border-accent ring-2 ring-indigo-600/15"
          : "border-hair hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)]"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-bold",
            TONE_AV[entity.tone]
          )}
        >
          {entity.initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-ink truncate tracking-[-.15px]">
            {entity.short}
          </div>
          <div className="text-[10.5px] text-ink-3 font-medium">
            {accountCount} {accountCount === 1 ? "conta" : "contas"}
          </div>
        </div>
      </div>

      <div>
        <div className="text-[19px] font-bold text-ink mono tracking-[-.4px]">{fmtCompact(total)}</div>
        <div
          className={cn(
            "text-[11px] font-semibold mt-0.5 flex items-center gap-1",
            avgVar > 0 ? "text-ok" : avgVar < 0 ? "text-err" : "text-ink-2"
          )}
        >
          {avgVar > 0 ? "+" : ""}
          {avgVar.toFixed(1)}% mês
        </div>
      </div>

      <div className="flex items-center justify-between text-[10.5px] text-ink-3 font-medium pt-2 border-t border-hair-2">
        <span>Ver detalhes</span>
        <Icon name="chevron" size={11} />
      </div>
    </button>
  )
}
