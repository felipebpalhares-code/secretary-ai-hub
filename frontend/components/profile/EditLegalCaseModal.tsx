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
  createLegalCase,
  updateLegalCase,
  type LegalCase,
  type LegalCaseInput,
} from "@/lib/api"

const empty: LegalCaseInput = {
  case_number: "",
  case_type: null,
  court: null,
  lawyer_name: null,
  lawyer_oab: null,
  next_deadline: null,
  status: "active",
  outcome: null,
  closed_date: null,
  notes: null,
}

const TYPES = ["Trabalhista", "Cível", "Tributário", "Família", "Penal", "Empresarial", "Outro"]

export function EditLegalCaseModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: LegalCase | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<LegalCaseInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : empty)
      setError(null)
    }
  }, [open, initial])

  function setField<K extends keyof LegalCaseInput>(key: K, value: LegalCaseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.case_number.trim()) {
      setError("Número do processo é obrigatório")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (initial) await updateLegalCase(initial.id, form)
      else await createLegalCase(form)
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
      title={initial ? "Editar processo" : "Novo processo"}
      size="lg"
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
        <FormField label="Número do processo" required>
          <TextInput value={form.case_number}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("case_number", e.target.value)}
            placeholder="0000000-00.0000.0.00.0000" />
        </FormField>
        <FormField label="Tipo">
          <Select value={form.case_type ?? ""}
            onChange={(e) => setField("case_type", e.target.value || null)}>
            <option value="">—</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
      </div>
      <FormField label="Vara / Tribunal">
        <TextInput value={form.court ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("court", e.target.value || null)}
          placeholder="1ª Vara do Trabalho de Curitiba" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Advogado">
          <TextInput value={form.lawyer_name ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("lawyer_name", e.target.value || null)} />
        </FormField>
        <FormField label="OAB">
          <TextInput value={form.lawyer_oab ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("lawyer_oab", e.target.value || null)}
            placeholder="OAB/PR 12345" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Status">
          <Select value={form.status} onChange={(e) => setField("status", e.target.value)}>
            <option value="active">Ativo</option>
            <option value="closed">Encerrado</option>
          </Select>
        </FormField>
        {form.status === "active" ? (
          <FormField label="Próximo prazo">
            <TextInput type="date" value={form.next_deadline ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("next_deadline", e.target.value || null)} />
          </FormField>
        ) : (
          <FormField label="Encerrado em">
            <TextInput type="date" value={form.closed_date ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("closed_date", e.target.value || null)} />
          </FormField>
        )}
      </div>
      {form.status === "closed" && (
        <FormField label="Resultado">
          <TextInput value={form.outcome ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("outcome", e.target.value || null)}
            placeholder="Acordo, procedente, improcedente…" />
        </FormField>
      )}
      <FormField label="Notas">
        <TextInput value={form.notes ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("notes", e.target.value || null)} />
      </FormField>
    </Modal>
  )
}
