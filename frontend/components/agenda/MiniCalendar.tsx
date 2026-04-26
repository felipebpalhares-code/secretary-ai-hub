"use client"
import { useState } from "react"
import { cn } from "@/lib/cn"

type DayState = "" | "muted" | "today" | "ev" | "urgent" | "selected"

const DAYS: { num: number; state: DayState }[] = [
  { num: 31, state: "muted" }, { num: 1, state: "" }, { num: 2, state: "ev" }, { num: 3, state: "" },
  { num: 4, state: "ev" }, { num: 5, state: "" }, { num: 6, state: "" },
  { num: 7, state: "ev" }, { num: 8, state: "" }, { num: 9, state: "ev" }, { num: 10, state: "" },
  { num: 11, state: "ev" }, { num: 12, state: "" }, { num: 13, state: "" },
  { num: 14, state: "ev" }, { num: 15, state: "" }, { num: 16, state: "ev" }, { num: 17, state: "ev" },
  { num: 18, state: "" }, { num: 19, state: "" }, { num: 20, state: "" },
  { num: 21, state: "urgent" }, { num: 22, state: "ev" }, { num: 23, state: "ev" }, { num: 24, state: "today" },
  { num: 25, state: "ev" }, { num: 26, state: "ev" }, { num: 27, state: "" },
  { num: 28, state: "" }, { num: 29, state: "" }, { num: 30, state: "urgent" },
  { num: 1, state: "muted" }, { num: 2, state: "muted" }, { num: 3, state: "muted" }, { num: 4, state: "muted" },
]

export function MiniCalendar() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-[10px]">
        <div className="text-[13px] font-bold text-ink tracking-[-.2px]">Abril 2026</div>
        <div className="flex gap-[3px]">
          <button className="w-[22px] h-[22px] rounded border border-hair bg-card text-ink-2 font-bold hover:border-ink-4 transition-colors">
            ‹
          </button>
          <button className="w-[22px] h-[22px] rounded border border-hair bg-card text-ink-2 font-bold hover:border-ink-4 transition-colors">
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px mb-px">
        {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[9.5px] font-bold text-ink-3 uppercase tracking-[.05em] py-[5px]"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {DAYS.map((d, i) => {
          const isSelected = selected === i
          const state = isSelected ? "selected" : d.state
          return (
            <button
              key={i}
              onClick={() => d.state !== "muted" && setSelected(i)}
              className={cn(
                "aspect-square flex items-center justify-center text-[11.5px] font-semibold rounded relative transition-colors",
                state === "muted" && "text-ink-4",
                state === "today" && "bg-accent text-white font-bold",
                state === "selected" && "bg-accent-soft text-accent",
                (state === "ev" || state === "urgent" || state === "") && "text-ink-2 hover:bg-bg"
              )}
            >
              {d.num}
              {d.state === "ev" && (
                <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
              {d.state === "urgent" && (
                <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-err" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
