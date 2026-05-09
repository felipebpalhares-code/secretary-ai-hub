"use client"
import { Modal } from "@/components/ui/Modal"
import { PrimaryButton, SecondaryButton } from "@/components/ui/FormField"

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={busy}>
            {cancelLabel}
          </SecondaryButton>
          {destructive ? (
            <button
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center gap-1.5 bg-err text-white text-[12px] font-semibold px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? "Aguarde…" : confirmLabel}
            </button>
          ) : (
            <PrimaryButton onClick={onConfirm} disabled={busy}>
              {busy ? "Aguarde…" : confirmLabel}
            </PrimaryButton>
          )}
        </>
      }
    >
      <div className="text-[12.5px] text-ink-2 leading-relaxed font-medium">{message}</div>
    </Modal>
  )
}
