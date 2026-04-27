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
  createInvestment,
  updateInvestment,
  type Investment,
  type InvestmentInput,
} from "@/lib/api"

const empty: InvestmentInput = {
  type: "Tesouro Direto",
  institution: null,
  approx_value: null,
  rate_description: null,
}

const TYPES = ["Tesouro Direto", "CDB", "LCI/LCA", "FII", "Ações", "ETF", "Fundo", "Cripto", "Outro"]

export function EditInvestmentModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: Investment | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<InvestmentInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : empty)
      setError(null)
    }
  }, [open, initial])

  function setField<K extends keyof InvestmentInput>(key: K, value: InvestmentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (initial) await updateInvestment(initial.id, form)
      else await createInvestment(form)
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
      title={initial ? "Editar investimento" : "Novo investimento"}
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
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo" required>
          <Select value={form.type} onChange={(e) => setField("type", e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Instituição">
          <TextInput value={form.institution ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("institution", e.target.value || null)}
            placeholder="Itaú, XP, Nubank…" />
        </FormField>
      </div>
      <FormField label="Valor aproximado (R$)">
        <TextInput type="number" min={0} step="0.01"
          value={form.approx_value ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("approx_value", e.target.value === "" ? null : Number(e.target.value))} />
      </FormField>
      <FormField label="Rentabilidade (descrição)" hint="Texto livre — ex: 112% CDI, +8% a.a.">
        <TextInput value={form.rate_description ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("rate_description", e.target.value || null)} />
      </FormField>
    </Modal>
  )
}
