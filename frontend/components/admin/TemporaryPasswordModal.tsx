"use client"
/**
 * Sprint H — exibe a senha temporária que o backend retornou em
 * POST /api/users ou POST /api/users/{id}/reset-password.
 *
 * A senha aparece apenas uma vez. Exige checkbox de confirmação antes
 * de fechar pra forçar o admin a copiar/anotar.
 */
import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Icon } from "@/components/Icon"

export function TemporaryPasswordModal({
  open,
  password,
  email,
  onClose,
}: {
  open: boolean
  password: string | null
  email?: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!open) {
      setCopied(false)
      setAcknowledged(false)
    }
  }, [open])

  async function copy() {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
    } catch {
      // ignore
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => acknowledged && onClose()}
      title="Senha temporária gerada"
      size="sm"
      footer={
        <button
          disabled={!acknowledged}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 bg-accent text-white text-[12px] font-semibold px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Fechar
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {email && (
          <div className="text-[12px] text-ink-3">
            E-mail: <span className="font-mono text-ink">{email}</span>
          </div>
        )}

        <div className="bg-warning-subtle border border-warning/30 rounded-md p-3 text-[12px] text-warning leading-relaxed">
          <strong>Esta senha não será mostrada novamente.</strong> Copie agora
          e envie ao usuário por canal seguro. Ele deve trocá-la no primeiro
          login.
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 bg-bg border border-hair rounded-md px-3 py-2 text-[14px] font-mono text-ink break-all">
            {password ?? "—"}
          </code>
          <button
            type="button"
            onClick={copy}
            disabled={!password}
            className="inline-flex items-center gap-1.5 bg-card border border-hair text-ink text-[12px] font-semibold px-3 py-2 rounded-md hover:border-ink-4 disabled:opacity-50 transition-colors"
          >
            <Icon name="check" size={13} />
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <label className="flex items-center gap-2 text-[12px] text-ink mt-1">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="rounded border-hair text-accent focus:ring-accent"
          />
          Salvei a senha em local seguro
        </label>
      </div>
    </Modal>
  )
}
