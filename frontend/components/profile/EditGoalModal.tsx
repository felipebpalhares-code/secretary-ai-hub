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
  createGoal,
  updateGoal,
  type Goal,
  type GoalCategory,
  type GoalInput,
} from "@/lib/api"

function emptyFor(category: GoalCategory, year: number): GoalInput {
  return { year, category, description: "", progress: 0, is_done: false }
}

export function EditGoalModal({
  open,
  onClose,
  initial,
  defaultCategory = "pessoal",
  defaultYear,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: Goal | null
  defaultCategory?: GoalCategory
  defaultYear: number
  onSaved: () => void
}) {
  const [form, setForm] = useState<GoalInput>(emptyFor(defaultCategory, defaultYear))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptyFor(defaultCategory, defaultYear))
      setError(null)
    }
  }, [open, initial, defaultCategory, defaultYear])

  function setField<K extends keyof GoalInput>(key: K, value: GoalInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.description.trim()) {
      setError("Descrição é obrigatória")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (initial) await updateGoal(initial.id, form)
      else await createGoal(form)
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
      title={initial ? "Editar meta" : "Nova meta"}
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
        <FormField label="Categoria" required>
          <Select value={form.category} onChange={(e) => setField("category", e.target.value as GoalCategory)}>
            <option value="pessoal">Pessoal</option>
            <option value="empresarial">Empresarial</option>
          </Select>
        </FormField>
        <FormField label="Ano" required>
          <TextInput type="number" min={2024} max={2099} value={form.year}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("year", Number(e.target.value))} />
        </FormField>
      </div>
      <FormField label="Descrição" required>
        <TextInput value={form.description}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("description", e.target.value)}
          placeholder="Ex: Faturar R$ 5M na PalharesTech" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Progresso (%)">
          <TextInput type="number" min={0} max={100} value={form.progress}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("progress", Number(e.target.value))} />
        </FormField>
        <FormField label="Status">
          <Select value={form.is_done ? "done" : "open"}
            onChange={(e) => setField("is_done", e.target.value === "done")}>
            <option value="open">Em andamento</option>
            <option value="done">Concluída</option>
          </Select>
        </FormField>
      </div>
    </Modal>
  )
}
