import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

type Props = {
  name: string
  sub: string
  iconName: Parameters<typeof Icon>[0]["name"]
  status: "on" | "off" | "idle"
  statusLabel: string
  phone: string
  phoneMuted?: boolean
  stats: { v: string; l: string }[]
  topColor: "ok" | "indigo" | "purple"
  primaryLabel: string
  secondaryLabel: string
}

const TOP_CLS = {
  ok: "border-t-ok",
  indigo: "border-t-accent",
  purple: "border-t-purple-600",
}

const STATUS_CLS = {
  on: "bg-emerald-50 text-emerald-700 border-emerald-200",
  off: "bg-amber-50 text-amber-700 border-amber-200",
  idle: "bg-hair-2 text-ink-3 border-hair",
}

export function ChannelCard(props: Props) {
  return (
    <div
      className={cn(
        "bg-card border border-hair border-t-2 rounded-lg p-4 flex flex-col gap-3",
        TOP_CLS[props.topColor]
      )}
    >
      <div className="flex items-center gap-[11px]">
        <div className="w-9 h-9 rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
          <Icon name={props.iconName} size={17} />
        </div>
        <div>
          <div className="text-[14px] font-bold text-ink tracking-[-.2px]">{props.name}</div>
          <div className="text-[11px] text-ink-3 mt-px font-medium">{props.sub}</div>
        </div>
        <span
          className={cn(
            "ml-auto text-[10px] font-bold px-2 py-0.5 rounded border tracking-[.03em]",
            STATUS_CLS[props.status]
          )}
        >
          {props.statusLabel}
        </span>
      </div>

      <div className={cn("text-[12px] font-semibold mono", props.phoneMuted ? "text-ink-3" : "text-ink")}>
        {props.phone}
      </div>

      <div className="grid grid-cols-3 gap-[6px]">
        {props.stats.map((s, i) => (
          <div key={i} className="bg-bg border border-hair rounded-md py-[7px] text-center">
            <div className="text-[15px] font-bold text-ink tabular">{s.v}</div>
            <div className="text-[9.5px] text-ink-3 font-semibold mt-px uppercase tracking-[.04em]">
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-[5px] mt-auto">
        <button className="px-2 py-[7px] rounded-md bg-accent text-white border border-accent text-[11.5px] font-semibold hover:bg-accent-hover transition-colors">
          {props.primaryLabel}
        </button>
        <button className="px-2 py-[7px] rounded-md bg-card text-ink border border-hair text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
          {props.secondaryLabel}
        </button>
      </div>
    </div>
  )
}
