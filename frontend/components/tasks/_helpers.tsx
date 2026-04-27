"use client"
import type { TaskItem } from "@/lib/api"

export const COLUMN_COLORS: { value: string | null; label: string; ring: string }[] = [
  { value: null, label: "Sem cor", ring: "bg-gray-300" },
  { value: "#ef4444", label: "Vermelho", ring: "bg-red-500" },
  { value: "#f59e0b", label: "Amarelo", ring: "bg-amber-500" },
  { value: "#10b981", label: "Verde", ring: "bg-emerald-500" },
  { value: "#3b82f6", label: "Azul", ring: "bg-blue-500" },
  { value: "#a855f7", label: "Roxo", ring: "bg-purple-500" },
]

export const PRIORITY_LABEL: Record<string, { label: string; cls: string }> = {
  low: { label: "Baixa", cls: "bg-slate-50 text-slate-600 border-slate-200" },
  medium: { label: "Média", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  high: { label: "Alta", cls: "bg-red-50 text-red-700 border-red-200" },
}

export type DueState = "overdue" | "today" | "tomorrow" | "future" | "none"

export function dueStateOf(t: TaskItem): DueState {
  if (!t.due_date) return "none"
  const d = new Date(t.due_date)
  if (isNaN(d.getTime())) return "none"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dDay = new Date(d)
  dDay.setHours(0, 0, 0, 0)
  if (dDay < today) return "overdue"
  if (dDay.getTime() === today.getTime()) return "today"
  if (dDay.getTime() === tomorrow.getTime()) return "tomorrow"
  return "future"
}

export function fmtDue(t: TaskItem): string {
  if (!t.due_date) return ""
  const d = new Date(t.due_date)
  if (isNaN(d.getTime())) return ""
  const state = dueStateOf(t)
  const datePart =
    state === "today"
      ? "Hoje"
      : state === "tomorrow"
        ? "Amanhã"
        : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
  if (t.due_time) {
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    return `${datePart}, ${time}`
  }
  return datePart
}

export function dueClass(state: DueState): string {
  switch (state) {
    case "overdue":
      return "text-red-600"
    case "today":
      return "text-indigo-600 font-semibold"
    case "tomorrow":
      return "text-gray-700"
    default:
      return "text-gray-500"
  }
}

/** Renderização markdown bem básica (negrito, itálico, link, lista). */
export function renderMarkdown(src: string): string {
  // escape HTML
  let html = src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  // links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-indigo-600 underline">$1</a>',
  )
  // bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  // italic *text*
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
  // listas
  const lines = html.split("\n")
  const out: string[] = []
  let inList = false
  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) {
      if (!inList) {
        out.push('<ul class="list-disc pl-5 my-1">')
        inList = true
      }
      out.push(`<li>${line.replace(/^\s*-\s+/, "")}</li>`)
    } else {
      if (inList) {
        out.push("</ul>")
        inList = false
      }
      if (line.trim() === "") {
        out.push("<br/>")
      } else {
        out.push(`<p class="my-1">${line}</p>`)
      }
    }
  }
  if (inList) out.push("</ul>")
  return out.join("")
}
