"use client"
import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { Modal } from "@/components/ui/Modal"
import {
  FormField,
  TextInput,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/FormField"
import { ExtractedHint, ScanDocumentButton } from "@/components/ui/ScanDocumentButton"
import {
  createPartner,
  updatePartner,
  type ExtractedPersonData,
  type Partner,
  type PartnerInput,
} from "@/lib/api"

const empty: PartnerInput = {
  name: "",
  cpf: null,
  phone: null,
  email: null,
  ownership: null,
}

export function EditPartnerModal({
  open,
  onClose,
  companyId,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  companyId: number
  initial: Partner | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<PartnerInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedCount, setExtractedCount] = useState(0)

  function applyExtracted(data: ExtractedPersonData) {
    let count = 0
    setForm((f) => {
      const next = { ...f }
      if (data.full_name) { next.name = data.full_name; count++ }
      if (data.cpf) { next.cpf = data.cpf; count++ }
      return next
    })
    setExtractedCount(count)
  }

  useEffect(() => {
    if (open) {
      setExtractedCount(0)
      setForm(
        initial
          ? {
              name: initial.name,
              cpf: initial.cpf,
              phone: initial.phone,
              email: initial.email,
              ownership: initial.ownership,
            }
          : empty,
      )
      setError(null)
    }
  }, [open, initial])

  function setField<K extends keyof PartnerInput>(key: K, value: PartnerInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Nome é obrigatório")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (initial) await updatePartner(initial.id, form)
      else await createPartner(companyId, form)
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Editar sócio" : "Novo sócio"}
      size="md"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={saving}>Cancelar</SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </PrimaryButton>
        </>
      }
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[12px] font-semibold px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex justify-end mb-3">
        <ScanDocumentButton onExtracted={applyExtracted} />
      </div>
      <ExtractedHint count={extractedCount} />
      <FormField label="Nome completo" required>
        <TextInput value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="CPF">
          <TextInput value={form.cpf ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("cpf", e.target.value || null)}
            placeholder="000.000.000-00" />
        </FormField>
        <FormField label="Participação (%)">
          <TextInput type="number" min={0} max={100} step={0.01}
            value={form.ownership ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setField("ownership", e.target.value === "" ? null : Number(e.target.value))} />
        </FormField>
      </div>
      <FormField label="Telefone">
        <TextInput value={form.phone ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("phone", e.target.value || null)}
          placeholder="(00) 00000-0000" />
      </FormField>
      <FormField label="E-mail">
        <TextInput type="email" value={form.email ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("email", e.target.value || null)} />
      </FormField>
    </Modal>
  )
}
