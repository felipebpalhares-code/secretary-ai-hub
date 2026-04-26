"use client"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { WEEK_EVENTS, type Event } from "@/lib/agenda-data"

const DAYS = [
  { name: "Seg", num: 20 },
  { name: "Ter", num: 21 },
  { name: "Qua", num: 22 },
  { name: "Qui", num: 23 },
  { name: "Sex", num: 24, today: true },
  { name: "Sáb", num: 25 },
  { name: "Dom", num: 26 },
]

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

const COLOR_CLS: Record<Event["color"], string> = {
  blue: "bg-blue-50 text-blue-800 border-blue-200",
  red: "bg-red-50 text-red-800 border-red-200",
  purple: "bg-purple-50 text-purple-800 border-purple-200",
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  orange: "bg-orange-50 text-orange-800 border-orange-200",
  pink: "bg-pink-50 text-pink-800 border-pink-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  indigo: "bg-accent-soft text-accent border-indigo-200",
}

export function WeekView({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex-1 bg-card border border-hair rounded-md overflow-hidden flex flex-col">
      <div
        className="grid border-b border-hair shrink-0"
        style={{ gridTemplateColumns: "54px repeat(7, 1fr)" }}
      >
        <div />
        {DAYS.map((d, i) => (
          <div
            key={i}
            className={cn(
              "py-[10px] px-[6px] text-center border-r border-hair-2 last:border-r-0",
              d.today && "bg-accent-soft/30"
            )}
          >
            <div
              className={cn(
                "text-[9.5px] font-bold uppercase tracking-[.06em]",
                d.today ? "text-accent" : "text-ink-3"
              )}
            >
              {d.name}
            </div>
            {d.today ? (
              <div className="mt-[2px] inline-flex items-center justify-center w-7 h-7 bg-accent text-white rounded-md font-bold text-[13px]">
                {d.num}
              </div>
            ) : (
              <div className="text-[18px] font-bold text-ink tracking-[-.3px] mt-[2px] leading-none">
                {d.num}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="flex-1 overflow-y-auto grid relative"
        style={{ gridTemplateColumns: "54px repeat(7, 1fr)" }}
      >
        <div className="flex flex-col border-r border-hair-2">
          {HOURS.map((h) => (
            <div
              key={h}
              className="h-[56px] px-[6px] pt-[3px] text-right text-[9.5px] text-ink-3 font-semibold border-b border-hair-2"
            >
              {h}
            </div>
          ))}
        </div>

        {DAYS.map((d, dayIdx) => (
          <div
            key={dayIdx}
            className={cn(
              "flex flex-col border-r border-hair-2 last:border-r-0 relative",
              d.today && "bg-accent-soft/20"
            )}
          >
            {HOURS.map((h) => (
              <div key={h} className="h-[56px] border-b border-hair-2 hover:bg-bg" />
            ))}
            {WEEK_EVENTS.filter((e) => e.day === dayIdx).map((ev) => (
              <button
                key={ev.id}
                onClick={() => onSelect(ev.id)}
                className={cn(
                  "absolute left-[3px] right-[3px] rounded-md px-[8px] py-[5px] text-[10.5px] font-semibold border text-left hover:shadow-[0_1px_3px_rgba(15,23,42,.06)] transition-all overflow-hidden",
                  COLOR_CLS[ev.color],
                  selected === ev.id && "ring-2 ring-accent z-10"
                )}
                style={{ top: ev.top, height: ev.height }}
              >
                <div className="font-bold truncate tracking-[-.1px] leading-tight">{ev.title}</div>
                <div className="text-[9.5px] opacity-85 mt-px">{ev.time}</div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
