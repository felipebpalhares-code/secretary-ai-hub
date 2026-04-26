import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

type AlertItem = {
  icon: Parameters<typeof Icon>[0]["name"]
  title: string
  meta: string
  tag: { label: string; variant: "red" | "amber" | "indigo" | "green" | "gray" }
}

type Props = {
  title: string
  count: string
  dotVariant: "warn" | "err" | "indigo"
  items: AlertItem[]
  footerLabel: string
}

const TAG_CLS = {
  red: "bg-red-50 text-red-700 border border-red-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  indigo: "bg-accent-soft text-accent border border-indigo-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  gray: "bg-hair-2 text-ink-2 border border-hair",
}

const DOT_CLS = {
  warn: "bg-warn",
  err: "bg-err",
  indigo: "bg-accent",
}

export function AlertCard({ title, count, dotVariant, items, footerLabel }: Props) {
  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-[14px] pb-[10px] border-b border-hair-2">
        <div className="flex items-center gap-2">
          <span className={cn("w-[7px] h-[7px] rounded-full", DOT_CLS[dotVariant])} />
          <span className="text-[13px] font-bold text-ink tracking-[-.2px]">{title}</span>
        </div>
        <span className="text-[10.5px] font-bold bg-hair-2 text-ink-2 px-[7px] py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="py-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-[10px] px-4 py-[10px] border-b border-hair-2 last:border-b-0 hover:bg-bg cursor-pointer transition-colors"
          >
            <div className="w-7 h-7 rounded-[7px] bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
              <Icon name={item.icon} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-ink tracking-[-.1px] truncate">
                {item.title}
              </div>
              <div className="text-[11px] text-ink-3 mt-0.5 font-medium">{item.meta}</div>
            </div>
            <span
              className={cn(
                "text-[10px] font-bold px-[7px] py-0.5 rounded whitespace-nowrap shrink-0 mt-px",
                TAG_CLS[item.tag.variant]
              )}
            >
              {item.tag.label}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 py-[10px] border-t border-hair-2">
        <a
          href="#"
          className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 tracking-[-.1px]"
        >
          {footerLabel} →
        </a>
      </div>
    </div>
  )
}
