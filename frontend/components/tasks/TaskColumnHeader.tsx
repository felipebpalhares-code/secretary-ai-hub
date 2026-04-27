"use client"
import { useEffect, useRef, useState } from "react"
import { Icon } from "@/components/Icon"
import type { TaskColumn } from "@/lib/api"
import { COLUMN_COLORS } from "./_helpers"

export function TaskColumnHeader({
  column,
  count,
  onRename,
  onChangeColor,
  onToggleDone,
  onDelete,
  onAdd,
  dragHandleProps,
}: {
  column: TaskColumn
  count: number
  onRename: (title: string) => void
  onChangeColor: (color: string | null) => void
  onToggleDone: () => void
  onDelete: () => void
  onAdd: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(column.title)
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setDraft(column.title), [column.title])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  function commit() {
    const v = draft.trim()
    if (v && v !== column.title) onRename(v)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <button
        type="button"
        {...dragHandleProps}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        aria-label="Arrastar coluna"
      >
        <Icon name="grip-vertical" size={14} />
      </button>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit()
            else if (e.key === "Escape") {
              setDraft(column.title)
              setEditing(false)
            }
          }}
          className="flex-1 bg-transparent text-[13px] font-semibold text-gray-900 focus:outline-none border-b border-indigo-300"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={() => setEditing(true)}
          className="flex-1 text-left text-[13px] font-semibold text-gray-900 truncate"
          title="Duplo-clique pra renomear"
        >
          {column.title}
        </button>
      )}

      <span className="text-[11px] font-medium text-gray-400 tabular">{count}</span>

      <button
        type="button"
        onClick={onAdd}
        className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors"
        aria-label="Adicionar tarefa"
      >
        <Icon name="plus" size={13} />
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
          aria-label="Mais opções"
        >
          <Icon name="more-horizontal" size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-[12.5px]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                setEditing(true)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            >
              <Icon name="edit" size={12} /> Renomear
            </button>
            <div className="px-3 py-1.5">
              <div className="text-[10.5px] font-bold text-gray-400 uppercase mb-1.5">Cor</div>
              <div className="flex flex-wrap gap-1">
                {COLUMN_COLORS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => {
                      onChangeColor(c.value)
                      setMenuOpen(false)
                    }}
                    title={c.label}
                    className={`w-5 h-5 rounded-full ${c.ring} ${
                      column.color === c.value ? "ring-2 ring-indigo-300 ring-offset-1" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onToggleDone()
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            >
              <Icon name="check" size={12} />
              {column.is_done_column ? "Desmarcar como Concluído" : "Marcar como Concluído"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onDelete()
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600"
            >
              <Icon name="trash" size={12} /> Apagar coluna
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
