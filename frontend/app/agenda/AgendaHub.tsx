"use client"
import { useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import { MiniCalendar } from "@/components/agenda/MiniCalendar"
import { WeekView } from "@/components/agenda/WeekView"
import { EventDetail } from "@/components/agenda/EventDetail"
import { WEEK_EVENTS } from "@/lib/agenda-data"
import { listTaskColumns, listTasks, type TaskColumn, type TaskItem } from "@/lib/api"
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal"
import { dueClass, dueStateOf, fmtDue } from "@/components/tasks/_helpers"

const CATEGORIES = [
  { id: "reunioes", label: "Reuniões", color: "bg-blue-600", count: 12 },
  { id: "prazos", label: "Prazos jurídicos", color: "bg-err", count: 3 },
  { id: "financeiro", label: "Financeiro", color: "bg-ok", count: 7 },
  { id: "obras", label: "Obras", color: "bg-orange-500", count: 5 },
  { id: "familia", label: "Família", color: "bg-pink-500", count: 4 },
  { id: "saude", label: "Saúde", color: "bg-err", count: 2 },
  { id: "viagem", label: "Viagem", color: "bg-accent", count: 1 },
  { id: "pessoal", label: "Pessoal", color: "bg-warn", count: 6 },
]

const CALENDARS = [
  { id: "google", label: "Google Calendar", letter: "G", status: "Sync", on: true },
  { id: "hub", label: "Hub interno", letter: "H", status: "Local", on: true },
  { id: "tjpr", label: "TJ-PR prazos", letter: "T", status: "Auto", on: true },
  { id: "outlook", label: "Outlook", letter: "O", status: "Off", on: false },
]

export function AgendaHub() {
  const [view, setView] = useState<"dia" | "semana" | "mes" | "lista">("semana")
  const [selectedEvent, setSelectedEvent] = useState<string | null>("e11")
  const [cats, setCats] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.slice(0, 7).map((c) => [c.id, true]))
  )

  // Tarefas com prazo
  const [taskColumns, setTaskColumns] = useState<TaskColumn[]>([])
  const [tasksWithDue, setTasksWithDue] = useState<TaskItem[]>([])
  const [openTask, setOpenTask] = useState<TaskItem | null>(null)

  const reloadTasks = async () => {
    try {
      const [cols, all] = await Promise.all([listTaskColumns(), listTasks()])
      setTaskColumns(cols)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      const cutoff = Date.now() + sevenDays
      const dueColumns = new Set(cols.filter((c) => c.is_done_column).map((c) => c.id))
      const filtered = all
        .filter((t) => t.due_date && !dueColumns.has(t.column_id))
        .filter((t) => new Date(t.due_date as string).getTime() < cutoff)
        .sort((a, b) =>
          new Date(a.due_date as string).getTime() - new Date(b.due_date as string).getTime(),
        )
      setTasksWithDue(filtered)
    } catch {
      // silencioso — agenda continua funcionando sem tasks
    }
  }

  useEffect(() => {
    void reloadTasks()
  }, [])

  return (
    <div className="flex-1 flex overflow-hidden min-w-0">
      <aside className="w-[262px] min-w-[262px] bg-card border-r border-hair overflow-y-auto p-4 shrink-0">
        <MiniCalendar />

        <SectionLabel>Categorias</SectionLabel>
        {CATEGORIES.map((c) => (
          <div
            key={c.id}
            onClick={() => setCats((s) => ({ ...s, [c.id]: !s[c.id] }))}
            className={cn(
              "flex items-center gap-[10px] px-[10px] py-[7px] rounded-md cursor-pointer text-[12px] font-semibold text-ink-2 transition-colors mb-px",
              cats[c.id] ? "bg-bg" : "hover:bg-bg"
            )}
          >
            <span className={cn("w-[10px] h-[10px] rounded-sm shrink-0", c.color)} />
            <span className="flex-1">{c.label}</span>
            <span className="text-[10.5px] text-ink-3 font-bold">{c.count}</span>
          </div>
        ))}

        <SectionLabel>Calendários</SectionLabel>
        {CALENDARS.map((cal) => (
          <div
            key={cal.id}
            className="flex items-center gap-[10px] px-[10px] py-[7px] rounded-md cursor-pointer text-[12px] font-semibold text-ink-2 hover:bg-bg transition-colors mb-px"
          >
            <span className="w-5 h-5 rounded bg-bg border border-hair flex items-center justify-center text-[11px] font-extrabold text-ink-2 shrink-0">
              {cal.letter}
            </span>
            <span className="flex-1">{cal.label}</span>
            <span
              className={cn(
                "text-[9px] font-bold px-[6px] py-px rounded border",
                cal.on
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-hair-2 text-ink-3 border-hair"
              )}
            >
              {cal.status}
            </span>
          </div>
        ))}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden px-[18px] py-4 gap-3">
        <div className="flex gap-[10px] items-center shrink-0">
          <div className="flex items-center gap-[10px] bg-card border border-hair rounded-md px-3 py-[6px]">
            <button className="w-[26px] h-[26px] rounded border border-hair bg-card text-ink-2 font-bold hover:border-ink-4 transition-colors">
              ‹
            </button>
            <button className="px-3 py-[5px] rounded bg-accent-soft text-accent border border-indigo-200 text-[11.5px] font-bold hover:bg-indigo-100 transition-colors">
              Hoje
            </button>
            <button className="w-[26px] h-[26px] rounded border border-hair bg-card text-ink-2 font-bold hover:border-ink-4 transition-colors">
              ›
            </button>
            <div className="text-[13px] font-bold text-ink tracking-[-.2px] min-w-[160px]">
              20–26 Abril 2026
            </div>
          </div>
          <div className="flex ml-auto bg-card border border-hair rounded-md p-[2px]">
            {(["dia", "semana", "mes", "lista"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-[12px] py-[6px] rounded text-[11.5px] font-semibold capitalize transition-colors",
                  view === v ? "bg-bg text-ink" : "text-ink-3 hover:text-ink-2"
                )}
              >
                {v === "mes" ? "Mês" : v}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-hair border-l-[3px] border-l-pink-500 rounded-md px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-[30px] h-[30px] rounded-md bg-pink-50 text-pink-700 flex items-center justify-center text-[15px] font-bold shrink-0">
            A
          </div>
          <div>
            <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
              Ana: semana cheia · 4 eventos hoje · aniversário amanhã
            </div>
            <div className="text-[11px] text-ink-2 mt-px font-medium">
              Jantar Mistura 20h reservado · Dr. Silva alertou prazo 12d · Engenheiro confirmou reunião 14h
            </div>
          </div>
        </div>

        {tasksWithDue.length > 0 && (
          <div className="bg-card border border-dashed border-hair rounded-md px-3 py-2.5 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="check-square" size={13} className="text-ink-3" />
              <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.07em]">
                Tarefas com prazo (próximos 7 dias)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tasksWithDue.map((t) => {
                const ds = dueStateOf(t)
                const baseCls = dueClass(ds)
                return (
                  <button
                    key={t.id}
                    onClick={() => setOpenTask(t)}
                    className={cn(
                      "inline-flex items-center gap-1.5 border border-dashed bg-bg rounded-md px-2 py-1 text-[11.5px] font-medium hover:bg-card transition-colors",
                      ds === "overdue"
                        ? "border-red-300"
                        : ds === "today"
                          ? "border-indigo-300"
                          : "border-hair"
                    )}
                  >
                    <Icon name="check-square" size={11} className={baseCls} />
                    <span className="text-ink truncate max-w-[200px]">{t.title}</span>
                    <span className={cn("text-[10.5px] font-semibold", baseCls)}>
                      {fmtDue(t)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <WeekView selected={selectedEvent} onSelect={setSelectedEvent} />
      </div>

      {selectedEvent && (
        <EventDetail
          event={WEEK_EVENTS.find((e) => e.id === selectedEvent)}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <TaskDetailModal
        open={openTask !== null}
        task={openTask}
        columns={taskColumns}
        onClose={() => setOpenTask(null)}
        onChanged={reloadTasks}
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 mb-2 px-[2px] text-[10px] font-bold text-ink-3 uppercase tracking-[.07em]">
      {children}
    </div>
  )
}
