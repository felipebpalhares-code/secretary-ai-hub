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
  createFamilyMember,
  updateFamilyMember,
  type FamilyMember,
  type FamilyMemberInput,
  type FamilyRelation,
} from "@/lib/api"

const RELATION_LABEL: Record<FamilyRelation, string> = {
  conjuge: "Cônjuge",
  filho: "Filho(a)",
  pai: "Pai",
  mae: "Mãe",
  irmao: "Irmão(ã)",
}

function emptyFor(relation: FamilyRelation): FamilyMemberInput {
  return {
    relation,
    name: "",
    cpf: null,
    birth_date: null,
    phone: null,
    email: null,
    school: null,
    school_phone: null,
    doctor_name: null,
    notes: null,
  }
}

export function EditFamilyMemberModal({
  open,
  onClose,
  initial,
  defaultRelation = "filho",
  lockRelation = false,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: FamilyMember | null
  defaultRelation?: FamilyRelation
  lockRelation?: boolean
  onSaved: () => void
}) {
  const [form, setForm] = useState<FamilyMemberInput>(emptyFor(defaultRelation))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          relation: initial.relation as FamilyRelation,
          name: initial.name,
          cpf: initial.cpf,
          birth_date: initial.birth_date,
          phone: initial.phone,
          email: initial.email,
          school: initial.school,
          school_phone: initial.school_phone,
          doctor_name: initial.doctor_name,
          notes: initial.notes,
        })
      } else {
        setForm(emptyFor(defaultRelation))
      }
      setError(null)
    }
  }, [open, initial, defaultRelation])

  function setField<K extends keyof FamilyMemberInput>(key: K, value: FamilyMemberInput[K]) {
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
      if (initial) await updateFamilyMember(initial.id, form)
      else await createFamilyMember(form)
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  const isChild = form.relation === "filho"

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Editar ${RELATION_LABEL[form.relation as FamilyRelation] ?? "membro"}` : `Novo ${RELATION_LABEL[form.relation as FamilyRelation] ?? "membro"}`}
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
        <FormField label="Relação" required>
          <Select value={form.relation} disabled={lockRelation}
            onChange={(e) => setField("relation", e.target.value as FamilyRelation)}>
            {Object.entries(RELATION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Nome completo" required>
          <TextInput value={form.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nascimento">
          <TextInput type="date" value={form.birth_date ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("birth_date", e.target.value || null)} />
        </FormField>
        <FormField label="CPF">
          <TextInput value={form.cpf ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("cpf", e.target.value || null)}
            placeholder="000.000.000-00" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Telefone / WhatsApp">
          <TextInput value={form.phone ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("phone", e.target.value || null)} />
        </FormField>
        <FormField label="E-mail">
          <TextInput type="email" value={form.email ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("email", e.target.value || null)} />
        </FormField>
      </div>

      {isChild && (
        <>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mt-2 mb-2">
            Escola
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Escola">
              <TextInput value={form.school ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setField("school", e.target.value || null)} />
            </FormField>
            <FormField label="Telefone da escola">
              <TextInput value={form.school_phone ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setField("school_phone", e.target.value || null)} />
            </FormField>
          </div>
        </>
      )}

      <FormField label="Médico responsável">
        <TextInput value={form.doctor_name ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("doctor_name", e.target.value || null)}
          placeholder="Dr. Pedro Almeida" />
      </FormField>

      <FormField label="Notas">
        <TextInput value={form.notes ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("notes", e.target.value || null)}
          placeholder="Alergias, preferências, observações…" />
      </FormField>
    </Modal>
  )
}
