"use client"
import { useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Modal } from "@/components/ui/Modal"
import {
  deleteTask,
  updateTask,
  type TaskColumn,
  type TaskItem,
} from "@/lib/api"
import { PRIORITY_LABEL, renderMarkdown } from "./_helpers"

const PRIORITIES: { value: "low" | "medium" | "high"; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
]

function timeAgo(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return "agora"
  if (sec < 3600) return `há ${Math.floor(sec / 60)} min`
  if (sec < 86400) return `há ${Math.floor(sec / 3600)} h`
  return `há ${Math.floor(sec / 86400)} d`
}

function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function TaskDetailModal({
  open,
  task,
  columns,
  onClose,
  onChanged,
}: {
  open: boolean
  task: TaskItem | null
  columns: TaskColumn[]
  onClose: () => void
  onChanged: () => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("")
  const [dueDate, setDueDate] = useState("")  // YYYY-MM-DDTHH:mm
  const [columnId, setColumnId] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState("")
  const [editingDesc, setEditingDesc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && task) {
      setTitle(task.title)
      setDescription(task.description ?? "")
      setPriority((task.priority as typeof priority) ?? "")
      setDueDate(toLocalInput(task.due_date))
      setColumnId(task.column_id)
      setTags(task.tags)
      setTagDraft("")
      setEditingDesc(false)
      setError(null)
    }
  }, [open, task])

  if (!task) return null

  function addTag() {
    const v = tagDraft.trim()
    if (!v) return
    if (tags.includes(v)) {
      setTagDraft("")
      return
    }
    setTags([...tags, v])
    setTagDraft("")
  }

  async function handleSave() {
    if (!task) return
    setSaving(true)
    setError(null)
    try {
      const due_time = dueDate.includes("T") && !dueDate.endsWith("T00:00")
      await updateTask(task.id, {
        title: title.trim() || "Sem título",
        description: description || null,
        priority: priority || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        due_time: !!dueDate && due_time,
        tags,
        column_id: columnId,
      })
      onChanged()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    if (!window.confirm(`Apagar "${task.title}"?`)) return
    setSaving(true)
    try {
      await deleteTask(task.id)
      onChanged()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-gray-400">Criada {timeAgo(task.created_at)}</div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-[12px] font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
            >
              Apagar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-[12px] font-semibold bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      }
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[12px] font-semibold px-3 py-2 rounded mb-3">
          {error}
        </div>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da tarefa"
        className="w-full text-[20px] font-semibold text-gray-900 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-200 pb-2 mb-4"
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {/* Coluna */}
        <label className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] cursor-pointer hover:border-gray-300">
          <Icon name="grid" size={12} className="text-gray-500" />
          <select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="bg-transparent focus:outline-none text-gray-700 font-medium pr-1"
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        {/* Data */}
        <label className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] cursor-pointer hover:border-gray-300">
          <Icon name="calendar" size={12} className="text-gray-500" />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-transparent focus:outline-none text-gray-700 font-medium"
          />
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate("")}
              className="text-gray-400 hover:text-red-500"
            >
              <Icon name="close" size={11} />
            </button>
          )}
        </label>

        {/* Prioridade */}
        <label className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] cursor-pointer hover:border-gray-300">
          <Icon name="flag" size={12} className="text-gray-500" />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="bg-transparent focus:outline-none text-gray-700 font-medium pr-1"
          >
            <option value="">Sem prioridade</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Tags */}
      <div className="mb-5">
        <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Tags
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-[11.5px] font-medium"
            >
              {tag}
              <button
                onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-red-500"
              >
                <Icon name="close" size={10} />
              </button>
            </span>
          ))}
          <input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="+ adicionar"
            className="text-[11.5px] bg-transparent border border-dashed border-gray-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-indigo-400 placeholder:text-gray-400 w-28"
          />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Descrição
        </div>
        {editingDesc || !description ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setEditingDesc(false)}
            placeholder="Adicionar descrição… (suporta **negrito**, *itálico*, [link](url), - lista)"
            className="w-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-lg p-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-300 placeholder:text-gray-400"
            autoFocus={editingDesc}
          />
        ) : (
          <div
            onClick={() => setEditingDesc(true)}
            className="min-h-[80px] bg-gray-50 border border-gray-200 rounded-lg p-3 text-[13px] text-gray-800 cursor-text hover:border-gray-300 prose-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
          />
        )}
      </div>
    </Modal>
  )
}
