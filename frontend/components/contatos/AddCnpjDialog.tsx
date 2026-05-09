"use client"
import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { FormField, TextInput, PrimaryButton, SecondaryButton } from "@/components/ui/FormField"

function maskCnpj(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function AddCnpjDialog({
  open,
  orgName,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean
  orgName: string
  busy: boolean
  onClose: () => void
  onConfirm: (cnpjDigits: string) => void
}) {
  const [raw, setRaw] = useState("")
  const digits = raw.replace(/\D/g, "")
  const valid = digits.length === 14

  useEffect(() => {
    if (open) setRaw("")
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar CNPJ"
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={busy}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton onClick={() => valid && onConfirm(digits)} disabled={!valid || busy}>
            {busy ? "Buscando…" : "Buscar e salvar"}
          </PrimaryButton>
        </>
      }
    >
      <div className="text-[11.5px] text-ink-2 font-medium mb-3">
        Vamos consultar a Receita pelo CNPJ e atualizar os dados de{" "}
        <strong className="text-ink">{orgName}</strong>.
      </div>
      <FormField label="CNPJ" required hint="Aceita com ou sem máscara — só os 14 dígitos importam.">
        <TextInput
          value={maskCnpj(raw)}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="00.000.000/0000-00"
          autoFocus
        />
      </FormField>
      {raw && !valid && (
        <div className="text-[11px] text-err font-semibold">
          CNPJ deve conter 14 dígitos ({digits.length} digitados)
        </div>
      )}
    </Modal>
  )
}
