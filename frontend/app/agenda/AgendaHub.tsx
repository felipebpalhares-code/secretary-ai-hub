"use client"
import { useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import { MiniCalendar } from "@/components/agenda/MiniCalendar"
import { EmptyState } from "@/components/ui/EmptyState"
import { listTaskColumns, listTasks, type TaskColumn, type TaskItem } from "@/lib/api"
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal"
import { dueClass, dueStateOf, fmtDue } from "@/components/tasks/_helpers"

// Categorias e calendários predefinidos do sistema. Contadores ficam zerados
// até a integração com Google Calendar / API de eventos próprios estar pronta.
const CATEGORIES = [
  { id: "reunioes", label: "Reuniões" },
  { id: "prazos", label: "Prazos jurídicos" },
  { id: "financeiro", label: "Financeiro" },
  { id: "obras", label: "Obras" },
  { id: "familia", label: "Família" },
  { id: "saude", label: "Saúde" },
  { id: "viagem", label: "Viagem" },
  { id: "pessoal", label: "Pessoal" },
] as const

const CALENDARS = [
  { id: "google", label: "Google Calendar", letter: "G", status: "Off" },
  { id: "hub", label: "Hub interno", letter: "H", status: "Off" },
  { id: "tjpr", label: "TJ-PR prazos", letter: "T", status: "Off" },
  { id: "outlook", label: "Outlook", letter: "O", status: "Off" },
] as const

export function AgendaHub() {
  const [view, setView] = useState<"dia" | "semana" | "mes" | "lista">("semana")

  // Tarefas com prazo (já dinâmico — preserva)
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
        .sort(
          (a, b) =>
            new Date(a.due_date as string).getTime() -
            new Date(b.due_date as string).getTime(),
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
    <div className="flex-1 flex overflow-hidden min-w-0 bg-bg-app">
      <aside className="w-[262px] min-w-[262px] bg-bg-surface border-r border-default overflow-y-auto p-4 shrink-0">
        <MiniCalendar />

        <SectionLabel>Categorias</SectionLabel>
        {CATEGORIES.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between px-3 py-2 rounded-default text-body text-text-secondary hover:bg-bg-subtle cursor-pointer transition-colors mb-px"
          >
            <span>{c.label}</span>
            <span className="text-tiny text-text-tertiary tabular-nums">0</span>
          </div>
        ))}

        <SectionLabel>Calendários</SectionLabel>
        {CALENDARS.map((cal) => (
          <div
            key={cal.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-default cursor-pointer text-body text-text-secondary hover:bg-bg-subtle transition-colors mb-px"
          >
            <span className="w-5 h-5 rounded bg-bg-subtle border border-default flex items-center justify-center text-tiny font-bold text-text-secondary shrink-0">
              {cal.letter}
            </span>
            <span className="flex-1">{cal.label}</span>
            <span className="text-tiny font-bold px-1.5 py-0.5 rounded border bg-bg-muted text-text-tertiary border-default">
              {cal.status}
            </span>
          </div>
        ))}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden px-5 py-4 gap-3">
        {/* Toolbar */}
        <div className="flex gap-2.5 items-center shrink-0">
          <div className="flex items-center gap-2.5 bg-bg-surface border border-default rounded-default px-3 py-1.5">
            <button className="w-6 h-6 rounded border border-default bg-bg-surface text-text-secondary font-bold hover:border-strong transition-colors">
              ‹
            </button>
            <button className="px-3 py-1 rounded bg-brand-subtle text-brand border border-default text-small font-bold hover:bg-bg-muted transition-colors">
              Hoje
            </button>
            <button className="w-6 h-6 rounded border border-default bg-bg-surface text-text-secondary font-bold hover:border-strong transition-colors">
              ›
            </button>
          </div>
          <div className="flex ml-auto bg-bg-surface border border-default rounded-default p-0.5">
            {(["dia", "semana", "mes", "lista"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded text-small font-semibold capitalize transition-colors",
                  view === v
                    ? "bg-bg-subtle text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                {v === "mes" ? "Mês" : v}
              </button>
            ))}
          </div>
        </div>

        {/* Tarefas com prazo (mantém — é dinâmico) */}
        {tasksWithDue.length > 0 && (
          <div className="bg-bg-surface border border-dashed border-default rounded-md px-3 py-2.5 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="check-square" size={13} className="text-text-tertiary" />
              <span className="text-tiny font-bold text-text-tertiary uppercase tracking-wider">
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
                      "inline-flex items-center gap-1.5 border border-dashed bg-bg-app rounded-md px-2 py-1 text-small font-medium hover:bg-bg-surface transition-colors",
                      ds === "overdue"
                        ? "border-danger/40"
                        : ds === "today"
                          ? "border-brand/40"
                          : "border-default",
                    )}
                  >
                    <Icon name="check-square" size={11} className={baseCls} />
                    <span className="text-text-primary truncate max-w-[200px]">
                      {t.title}
                    </span>
                    <span className={cn("text-tiny font-semibold", baseCls)}>
                      {fmtDue(t)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state — sem eventos cadastrados */}
        <div className="flex-1 bg-bg-surface border border-default rounded-xl flex items-center justify-center">
          <EmptyState
            icon="calendar"
            title="Sem eventos cadastrados"
            subtitle={
              <>
                Quando uma integração com calendário (Google Calendar) for ativada
                ou eventos próprios forem criados, eles aparecem aqui na grade
                semanal. Tarefas com prazo continuam aparecendo no banner acima
                conforme você cadastra em <a className="text-brand underline" href="/tarefas">/tarefas</a>.
              </>
            }
          />
        </div>
      </div>

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
    <div className="mt-4 mb-2 px-2 text-tiny font-bold text-text-tertiary uppercase tracking-wider">
      {children}
    </div>
  )
}
