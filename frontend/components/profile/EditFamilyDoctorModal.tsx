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
  createFamilyDoctor,
  updateFamilyDoctor,
  type FamilyDoctor,
  type FamilyDoctorInput,
} from "@/lib/api"

const empty: FamilyDoctorInput = {
  name: "",
  specialty: null,
  phone: null,
  clinic: null,
  serves: null,
}

export function EditFamilyDoctorModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: FamilyDoctor | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<FamilyDoctorInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : empty)
      setError(null)
    }
  }, [open, initial])

  function setField<K extends keyof FamilyDoctorInput>(key: K, value: FamilyDoctorInput[K]) {
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
      if (initial) await updateFamilyDoctor(initial.id, form)
      else await createFamilyDoctor(form)
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
      title={initial ? "Editar médico" : "Novo médico"}
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
      <FormField label="Nome" required>
        <TextInput value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Especialidade">
          <TextInput value={form.specialty ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("specialty", e.target.value || null)}
            placeholder="Pediatra, Cardiologista…" />
        </FormField>
        <FormField label="Atende">
          <Select value={form.serves ?? ""}
            onChange={(e) => setField("serves", e.target.value || null)}>
            <option value="">—</option>
            <option value="filhos">Filhos</option>
            <option value="conjuge">Cônjuge</option>
            <option value="familia">Família toda</option>
            <option value="meu">Eu</option>
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Telefone">
          <TextInput value={form.phone ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("phone", e.target.value || null)} />
        </FormField>
        <FormField label="Clínica / Hospital">
          <TextInput value={form.clinic ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("clinic", e.target.value || null)} />
        </FormField>
      </div>
    </Modal>
  )
}
