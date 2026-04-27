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
import { ExtractedHint, ScanDocumentButton } from "@/components/ui/ScanDocumentButton"
import {
  createProfessional,
  updateProfessional,
  type ExtractedPersonData,
  type Professional,
  type ProfessionalInput,
} from "@/lib/api"

const empty: ProfessionalInput = {
  role: "contador",
  name: "",
  register: null,
  phone: null,
  email: null,
  notes: null,
}

const ROLE_LABEL: Record<string, string> = {
  contador: "Contador",
  advogado: "Advogado",
  corretor: "Corretor",
  engenheiro: "Engenheiro",
  outro: "Outro",
}

const REGISTER_LABEL: Record<string, string> = {
  contador: "CRC",
  advogado: "OAB",
  corretor: "CRECI",
  engenheiro: "CREA",
  outro: "Registro",
}

export function EditProfessionalModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: Professional | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<ProfessionalInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedCount, setExtractedCount] = useState(0)

  function applyExtracted(data: ExtractedPersonData) {
    let count = 0
    setForm((f) => {
      const next = { ...f }
      if (data.full_name) { next.name = data.full_name; count++ }
      // Profissional não tem campo CPF no form atual; se quiser anotar,
      // colocamos no campo "Notas" sem sobrescrever conteúdo existente.
      if (data.cpf && !next.notes) { next.notes = `CPF: ${data.cpf}`; count++ }
      return next
    })
    setExtractedCount(count)
  }

  useEffect(() => {
    if (open) {
      setExtractedCount(0)
      setForm(initial ? { ...initial } : empty)
      setError(null)
    }
  }, [open, initial])

  function setField<K extends keyof ProfessionalInput>(key: K, value: ProfessionalInput[K]) {
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
      if (initial) await updateProfessional(initial.id, form)
      else await createProfessional(form)
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
      title={initial ? "Editar profissional" : "Novo profissional"}
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
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Categoria" required>
          <Select value={form.role}
            onChange={(e) => setField("role", e.target.value)}>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={REGISTER_LABEL[form.role] ?? "Registro"}>
          <TextInput value={form.register ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("register", e.target.value || null)}
            placeholder="ex: 12345-PR" />
        </FormField>
      </div>
      <FormField label="Nome" required>
        <TextInput value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Telefone">
          <TextInput value={form.phone ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("phone", e.target.value || null)} />
        </FormField>
        <FormField label="E-mail">
          <TextInput type="email" value={form.email ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("email", e.target.value || null)} />
        </FormField>
      </div>
      <FormField label="Notas">
        <TextInput value={form.notes ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("notes", e.target.value || null)}
          placeholder="Especialidade, escritório, observações…" />
      </FormField>
    </Modal>
  )
}
