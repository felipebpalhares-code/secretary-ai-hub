"use client"
import { useMemo, useState } from "react"
import { cn } from "@/lib/cn"

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

type Cell = { num: number; date: Date; muted: boolean; isToday: boolean }

function buildGrid(year: number, month: number): Cell[] {
  // Grid começa na segunda (S T Q Q S S D conforme cabeçalho).
  const first = new Date(year, month, 1)
  const dayOfWeek = first.getDay() // 0=Dom..6=Sab
  const offset = (dayOfWeek + 6) % 7 // segunda como dia 0
  const start = new Date(year, month, 1 - offset)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells: Cell[] = []
  for (let i = 0; i < 35; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push({
      num: d.getDate(),
      date: d,
      muted: d.getMonth() !== month,
      isToday: d.getTime() === today.getTime(),
    })
  }
  return cells
}

export function MiniCalendar() {
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState<string | null>(null)

  const cells = useMemo(() => buildGrid(cursor.year, cursor.month), [cursor.year, cursor.month])

  const goPrev = () =>
    setCursor((c) => {
      const m = c.month - 1
      return m < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: m }
    })
  const goNext = () =>
    setCursor((c) => {
      const m = c.month + 1
      return m > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: m }
    })

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-[10px]">
        <div className="text-[13px] font-bold text-ink tracking-[-.2px]">
          {MONTHS_PT[cursor.month]} {cursor.year}
        </div>
        <div className="flex gap-[3px]">
          <button
            onClick={goPrev}
            aria-label="Mês anterior"
            className="w-[22px] h-[22px] rounded border border-hair bg-card text-ink-2 font-bold hover:border-ink-4 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            aria-label="Próximo mês"
            className="w-[22px] h-[22px] rounded border border-hair bg-card text-ink-2 font-bold hover:border-ink-4 transition-colors"
          >
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
        {cells.map((d, i) => {
          const key = d.date.toISOString().slice(0, 10)
          const isSelected = selected === key
          return (
            <button
              key={i}
              onClick={() => !d.muted && setSelected(key)}
              className={cn(
                "aspect-square flex items-center justify-center text-[11.5px] font-semibold rounded relative transition-colors",
                d.muted && "text-ink-4",
                d.isToday && !isSelected && "bg-accent text-white font-bold",
                isSelected && "bg-accent-soft text-accent",
                !d.muted && !d.isToday && !isSelected && "text-ink-2 hover:bg-bg",
              )}
            >
              {d.num}
            </button>
          )
        })}
      </div>
    </div>
  )
}
