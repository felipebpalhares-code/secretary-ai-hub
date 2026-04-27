"use client"
import { useEffect, useRef, useState } from "react"

export function TaskInlineCreate({
  onSubmit,
  onCancel,
  autoOpenNext = true,
}: {
  onSubmit: (title: string) => Promise<void>
  onCancel: () => void
  autoOpenNext?: boolean
}) {
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function commit(keepOpen: boolean) {
    const v = title.trim()
    if (!v) {
      onCancel()
      return
    }
    setSaving(true)
    try {
      await onSubmit(v)
      setTitle("")
      if (!keepOpen || !autoOpenNext) {
        onCancel()
      } else {
        inputRef.current?.focus()
      }
    } catch {
      // mantém o texto pra usuário tentar de novo
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-indigo-300 rounded-lg p-3 ring-2 ring-indigo-100">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            void commit(true)
          } else if (e.key === "Escape") {
            e.preventDefault()
            onCancel()
          }
        }}
        placeholder="Digite o título da tarefa…"
        className="w-full bg-transparent text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
        disabled={saving}
      />
      <div className="flex items-center justify-end gap-2 mt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="text-[11.5px] font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={() => void commit(false)}
          disabled={saving || !title.trim()}
          className="text-[11.5px] font-semibold bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Adicionando…" : "Adicionar"}
        </button>
      </div>
    </div>
  )
}
