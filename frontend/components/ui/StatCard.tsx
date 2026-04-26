import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

type Props = {
  icon: Parameters<typeof Icon>[0]["name"]
  value: string | number
  label: string
  meta?: string
  trend?: { label: string; variant: "up" | "down" | "neutral" }
  progress?: { value: number; color?: "default" | "err" | "warn" | "ok" }
}

const TREND_CLS = {
  up: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  down: "bg-red-50 text-red-700 border border-red-200",
  neutral: "bg-hair-2 text-ink-2 border border-hair",
}

const PROGRESS_CLS = {
  default: "bg-accent",
  err: "bg-err",
  warn: "bg-warn",
  ok: "bg-ok",
}

export function StatCard({ icon, value, label, meta, trend, progress }: Props) {
  return (
    <div className="bg-card border border-hair rounded-lg p-5 flex flex-col gap-3 hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)] transition-all">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-bg border border-hair flex items-center justify-center text-ink-2">
          <Icon name={icon} size={17} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-full",
              TREND_CLS[trend.variant]
            )}
          >
            {trend.label}
          </span>
        )}
      </div>
      <div>
        <div className="text-[26px] font-bold text-ink tracking-[-.6px] leading-none tabular">{value}</div>
        <div className="text-[13px] font-semibold text-ink mt-[6px] tracking-[-.15px]">{label}</div>
        {meta && <div className="text-[11px] text-ink-3 mt-0.5 font-medium">{meta}</div>}
      </div>
      {progress !== undefined && (
        <div className="h-[3px] rounded-full bg-hair-2 overflow-hidden">
          <div
            className={cn("h-full rounded-full", PROGRESS_CLS[progress.color ?? "default"])}
            style={{ width: `${progress.value}%` }}
          />
        </div>
      )}
    </div>
  )
}
