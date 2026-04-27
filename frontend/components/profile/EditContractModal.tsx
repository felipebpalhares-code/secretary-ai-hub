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
import {
  createContract,
  updateContract,
  type Contract,
  type ContractInput,
} from "@/lib/api"

const empty: ContractInput = {
  type: "",
  parties: null,
  expiry_date: null,
  notes: null,
}

export function EditContractModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: Contract | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<ContractInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : empty)
      setError(null)
    }
  }, [open, initial])

  function setField<K extends keyof ContractInput>(key: K, value: ContractInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.type.trim()) {
      setError("Tipo do contrato é obrigatório")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (initial) await updateContract(initial.id, form)
      else await createContract(form)
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
      title={initial ? "Editar contrato" : "Novo contrato"}
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
      <FormField label="Tipo / nome" required>
        <TextInput value={form.type}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("type", e.target.value)}
          placeholder="Locação comercial, prestação de serviços…" />
      </FormField>
      <FormField label="Partes envolvidas">
        <TextInput value={form.parties ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("parties", e.target.value || null)}
          placeholder="PalharesTech × Imobiliária ABC" />
      </FormField>
      <FormField label="Vencimento">
        <TextInput type="date" value={form.expiry_date ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("expiry_date", e.target.value || null)} />
      </FormField>
      <FormField label="Notas">
        <TextInput value={form.notes ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("notes", e.target.value || null)} />
      </FormField>
    </Modal>
  )
}
