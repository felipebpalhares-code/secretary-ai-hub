"use client"
import { useEffect } from "react"
import type { ReactNode } from "react"
import { Icon } from "@/components/Icon"

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg"
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative bg-card border border-hair rounded-lg shadow-xl w-full ${widths[size]} mx-4 max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-hair">
          <h2 className="text-[14px] font-bold text-ink tracking-[-.15px]">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink p-1 rounded transition-colors"
            aria-label="Fechar"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-hair p-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
