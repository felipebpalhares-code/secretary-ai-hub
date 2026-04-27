"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Icon } from "@/components/Icon"
import {
  createTask,
  createTaskColumn,
  deleteTaskColumn,
  listTaskColumns,
  listTasks,
  updateTaskColumn,
  type TaskColumn,
  type TaskItem,
} from "@/lib/api"
import { TaskColumnView } from "./TaskColumnView"
import { TaskDetailModal } from "./TaskDetailModal"
import { dueStateOf } from "./_helpers"

type Filter = "all" | "today" | "overdue" | "none"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "today", label: "Hoje" },
  { id: "overdue", label: "Atrasadas" },
  { id: "none", label: "Sem data" },
]

export function TaskBoard() {
  const [columns, setColumns] = useState<TaskColumn[] | null>(null)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [openTask, setOpenTask] = useState<TaskItem | null>(null)
  const [creatingColumn, setCreatingColumn] = useState(false)
  const [columnDraft, setColumnDraft] = useState("")
  const newTaskTriggerRef = useRef<(() => void) | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      const [cols, ts] = await Promise.all([listTaskColumns(), listTasks()])
      setColumns(cols)
      setTasks(ts)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar tarefas")
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Atalhos: N (nova tarefa), 1-4 (filtros), Esc (fechar é tratado nos filhos)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      if (isInput) return
      if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        newTaskTriggerRef.current?.()
      } else if (e.key === "1") setFilter("all")
      else if (e.key === "2") setFilter("today")
      else if (e.key === "3") setFilter("overdue")
      else if (e.key === "4") setFilter("none")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const tasksByColumn = useMemo(() => {
    const map: Record<string, TaskItem[]> = {}
    const filtered = tasks.filter((t) => {
      const ds = dueStateOf(t)
      if (filter === "today") return ds === "today"
      if (filter === "overdue") return ds === "overdue"
      if (filter === "none") return ds === "none"
      return true
    })
    for (const t of filtered) {
      ;(map[t.column_id] ||= []).push(t)
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) => a.order - b.order)
    }
    return map
  }, [tasks, filter])

  const triggerNewTaskFirstColumn = useCallback(() => {
    // sinaliza pra primeira coluna abrir o input — vamos delegar via prop
    if (!columns || columns.length === 0) return
    const firstId = columns[0].id
    void (async () => {
      const t = await createTask({ column_id: firstId, title: "Nova tarefa" })
      setTasks((prev) => [...prev, t])
      setOpenTask(t)
    })()
  }, [columns])

  // expõe pro listener de N
  useEffect(() => {
    newTaskTriggerRef.current = triggerNewTaskFirstColumn
  }, [triggerNewTaskFirstColumn])

  async function handleCreateTask(columnId: string, title: string) {
    const t = await createTask({ column_id: columnId, title })
    setTasks((prev) => [...prev, t])
  }

  async function handleColumnRename(c: TaskColumn, title: string) {
    const updated = await updateTaskColumn(c.id, { title })
    setColumns((prev) => prev?.map((x) => (x.id === c.id ? updated : x)) ?? null)
  }

  async function handleColumnColor(c: TaskColumn, color: string | null) {
    const updated = await updateTaskColumn(c.id, { color })
    setColumns((prev) => prev?.map((x) => (x.id === c.id ? updated : x)) ?? null)
  }

  async function handleColumnToggleDone(c: TaskColumn) {
    const updated = await updateTaskColumn(c.id, { is_done_column: !c.is_done_column })
    setColumns((prev) => prev?.map((x) => (x.id === c.id ? updated : x)) ?? null)
  }

  async function handleColumnDelete(c: TaskColumn) {
    if (!window.confirm(`Apagar coluna "${c.title}"? As tarefas vão pra primeira coluna restante.`))
      return
    try {
      await deleteTaskColumn(c.id)
      await reload()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao apagar coluna")
    }
  }

  async function handleCreateColumn() {
    const v = columnDraft.trim()
    if (!v) {
      setCreatingColumn(false)
      return
    }
    const col = await createTaskColumn({ title: v })
    setColumns((prev) => [...(prev ?? []), col])
    setColumnDraft("")
    setCreatingColumn(false)
  }

  if (columns === null) {
    return <div className="p-8 text-center text-gray-500 text-sm font-medium">Carregando…</div>
  }
  if (error) {
    return (
      <div className="p-4 m-6 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Tarefas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Organize suas tarefas em quadros</p>
        </div>
        <button
          onClick={triggerNewTaskFirstColumn}
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Icon name="plus" size={14} />
          Nova tarefa
        </button>
      </div>

      {/* Filtros */}
      <div className="px-6 pb-3 flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-[12px] font-medium px-3 py-1 rounded-full border transition-colors ${
              filter === f.id
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory">
        <div className="flex gap-4 px-6 pb-6 min-h-full items-start">
          {columns.map((c) => (
            <TaskColumnView
              key={c.id}
              column={c}
              tasks={tasksByColumn[c.id] ?? []}
              onCreateTask={(title) => handleCreateTask(c.id, title)}
              onOpenTask={setOpenTask}
              onRename={(title) => handleColumnRename(c, title)}
              onChangeColor={(color) => handleColumnColor(c, color)}
              onToggleDone={() => handleColumnToggleDone(c)}
              onDelete={() => handleColumnDelete(c)}
            />
          ))}

          {/* Adicionar coluna */}
          <div className="w-[280px] md:w-[320px] shrink-0 snap-center">
            {creatingColumn ? (
              <div className="bg-white border border-indigo-300 ring-2 ring-indigo-100 rounded-xl p-3">
                <input
                  autoFocus
                  value={columnDraft}
                  onChange={(e) => setColumnDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleCreateColumn()
                    else if (e.key === "Escape") {
                      setColumnDraft("")
                      setCreatingColumn(false)
                    }
                  }}
                  placeholder="Nome da coluna"
                  className="w-full bg-transparent text-[13px] font-semibold text-gray-900 focus:outline-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setColumnDraft("")
                      setCreatingColumn(false)
                    }}
                    className="text-[11.5px] font-semibold text-gray-500 px-2 py-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => void handleCreateColumn()}
                    className="text-[11.5px] font-semibold bg-indigo-600 text-white px-3 py-1 rounded"
                  >
                    Criar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreatingColumn(true)}
                className="w-full bg-white/50 hover:bg-white border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-400 rounded-xl py-4 text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="plus" size={14} />
                Nova coluna
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dica de atalho */}
      <div className="absolute bottom-4 right-4 hidden md:block bg-white border border-gray-200 rounded-md px-3 py-1.5 text-[11px] text-gray-500 font-medium shadow-sm pointer-events-none">
        Aperte <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold">N</kbd> pra
        nova tarefa
      </div>

      <TaskDetailModal
        open={openTask !== null}
        task={openTask}
        columns={columns}
        onClose={() => setOpenTask(null)}
        onChanged={reload}
      />
    </div>
  )
}
