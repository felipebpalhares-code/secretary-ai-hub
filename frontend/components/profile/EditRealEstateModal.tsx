"use client"
import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { Modal } from "@/components/ui/Modal"
import {
  FormField,
  TextInput,
  Select,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/FormField"
import {
  createRealEstate,
  updateRealEstate,
  type RealEstate,
  type RealEstateInput,
} from "@/lib/api"

const empty: RealEstateInput = {
  label: "",
  address: null,
  registration: null,
  approx_value: null,
  is_financed: false,
  financed_until: null,
}

export function EditRealEstateModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: RealEstate | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<RealEstateInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : empty)
      setError(null)
    }
  }, [open, initial])

  function setField<K extends keyof RealEstateInput>(key: K, value: RealEstateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.label.trim()) {
      setError("Etiqueta é obrigatória (ex: Residência, Sala comercial)")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (initial) await updateRealEstate(initial.id, form)
      else await createRealEstate(form)
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
      title={initial ? "Editar imóvel" : "Novo imóvel"}
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
      <FormField label="Etiqueta" required hint="Como você se refere ao imóvel">
        <TextInput value={form.label}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("label", e.target.value)}
          placeholder="Residência Batel, Sala comercial XV…" />
      </FormField>
      <FormField label="Endereço">
        <TextInput value={form.address ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("address", e.target.value || null)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Matrícula">
          <TextInput value={form.registration ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("registration", e.target.value || null)} />
        </FormField>
        <FormField label="Valor aproximado (R$)">
          <TextInput type="number" min={0} step="0.01"
            value={form.approx_value ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setField("approx_value", e.target.value === "" ? null : Number(e.target.value))} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Status">
          <Select value={form.is_financed ? "fin" : "qui"}
            onChange={(e) => setField("is_financed", e.target.value === "fin")}>
            <option value="qui">Quitado</option>
            <option value="fin">Financiado</option>
          </Select>
        </FormField>
        {form.is_financed && (
          <FormField label="Financiado até" hint="Mês/Ano (ex: 12/2031)">
            <TextInput value={form.financed_until ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("financed_until", e.target.value || null)}
              placeholder="MM/AAAA" />
          </FormField>
        )}
      </div>
    </Modal>
  )
}
