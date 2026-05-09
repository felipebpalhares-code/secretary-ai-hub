"use client"
import { useEffect, useRef, useState } from "react"
import { Icon } from "@/components/Icon"
import type { Category } from "@/lib/contacts-types"

/**
 * Menu "..." pra cada categoria na sidebar.
 * Click-outside fecha. Default categories deixam Excluir desabilitado.
 */
export function CategoryMenu({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="w-5 h-5 rounded text-text-tertiary hover:text-text-primary hover:bg-bg-muted flex items-center justify-center transition-colors"
        aria-label="Mais opções"
      >
        <Icon name="more-horizontal" size={13} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-6 z-30 min-w-[160px] bg-card border border-hair rounded-md shadow-md py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setOpen(false)
              onEdit()
            }}
            className="w-full text-left px-3 py-1.5 text-[12px] text-ink-2 hover:bg-bg-subtle flex items-center gap-2"
          >
            <Icon name="edit" size={12} />
            Editar
          </button>
          {category.is_default ? (
            <div
              className="w-full px-3 py-1.5 text-[12px] text-ink-3 cursor-not-allowed flex items-center gap-2"
              title="Categoria padrão"
            >
              <Icon name="trash" size={12} />
              <span>Excluir</span>
              <span className="ml-auto text-[10px] text-ink-3 font-medium">padrão</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setOpen(false)
                onDelete()
              }}
              className="w-full text-left px-3 py-1.5 text-[12px] text-err hover:bg-red-50 flex items-center gap-2"
            >
              <Icon name="trash" size={12} />
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}
