"use client"
import { useEffect, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { Icon } from "@/components/Icon"
import { Modal } from "@/components/ui/Modal"
import {
  FormField,
  TextInput,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/FormField"
import {
  getPreferences,
  updatePreferences,
  type Preferences,
} from "@/lib/api"

const DAYS = [
  { id: "seg", label: "Seg" },
  { id: "ter", label: "Ter" },
  { id: "qua", label: "Qua" },
  { id: "qui", label: "Qui" },
  { id: "sex", label: "Sex" },
  { id: "sab", label: "Sáb" },
  { id: "dom", label: "Dom" },
]

export function EditPreferencesModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Preferences | null>(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(null)
      setDraft("")
      setError(null)
      getPreferences()
        .then(setForm)
        .catch((e: unknown) => setError(e instanceof Error ? e.message : "Falha ao carregar"))
    }
  }, [open])

  if (!form) {
    return (
      <Modal open={open} onClose={onClose} title="Preferências" size="md">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 text-[12px] font-semibold px-3 py-2 rounded">
            {error}
          </div>
        ) : (
          <div className="text-center text-ink-3 text-[12.5px] py-6 font-medium">Carregando…</div>
        )}
      </Modal>
    )
  }

  const days = (form.work_days ?? "").split(",").map((d) => d.trim()).filter(Boolean)

  function toggleDay(d: string) {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d]
    setForm((f) => (f ? { ...f, work_days: next.join(",") } : f))
  }

  function setField<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
  }

  function addPriority() {
    const v = draft.trim()
    if (!v || !form) return
    setForm({ ...form, life_priorities: [...form.life_priorities, v] })
    setDraft("")
  }

  function removePriority(idx: number) {
    if (!form) return
    setForm({ ...form, life_priorities: form.life_priorities.filter((_, i) => i !== idx) })
  }

  function onPriorityKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addPriority()
    }
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      await updatePreferences(form)
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
      title="Preferências e disponibilidade"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormField label="Como prefere ser tratado">
            <TextInput value={form.how_to_address ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("how_to_address", e.target.value || null)}
              placeholder="Felipe" />
          </FormField>
          <FormField label="Estilo de comunicação" hint="Texto livre — exemplos: tom direto, sem rodeios, sempre bullets…">
            <TextInput value={form.communication_style ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("communication_style", e.target.value || null)} />
          </FormField>
          <FormField label="Contato de urgência">
            <TextInput value={form.emergency_contact ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("emergency_contact", e.target.value || null)}
              placeholder="(00) 00000-0000" />
          </FormField>
        </div>
        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-2">Horário de trabalho</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Início">
              <TextInput type="time" value={form.work_hours_start ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setField("work_hours_start", e.target.value || null)} />
            </FormField>
            <FormField label="Fim">
              <TextInput type="time" value={form.work_hours_end ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setField("work_hours_end", e.target.value || null)} />
            </FormField>
          </div>
          <FormField label="Dias úteis">
            <div className="grid grid-cols-7 gap-[5px]">
              {DAYS.map((d) => {
                const on = days.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`text-[11px] font-bold px-2 py-1.5 rounded border transition-colors ${
                      on
                        ? "bg-accent text-white border-accent"
                        : "bg-card text-ink-3 border-hair hover:border-ink-4"
                    }`}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </FormField>
        </div>
      </div>

      <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mt-4 mb-2">
        Prioridades de vida (em ordem)
      </div>
      <FormField label="" hint="Enter para adicionar. Ex: Família, Saúde, Negócios, Lazer.">
        <div className="flex gap-2">
          <TextInput value={draft}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
            onKeyDown={onPriorityKey}
            placeholder="Família, Saúde, Negócios…" />
          <button
            type="button"
            onClick={addPriority}
            className="bg-card border border-hair text-ink px-3 py-2 rounded-md text-[12px] font-semibold hover:border-accent hover:text-accent transition-colors"
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
      </FormField>
      {form.life_priorities.length > 0 && (
        <ol className="border border-hair rounded-md overflow-hidden bg-card mb-2">
          {form.life_priorities.map((p, i) => (
            <li
              key={`${p}-${i}`}
              className="flex items-center gap-3 px-3 py-2 border-b border-hair-2 last:border-b-0 text-[12.5px]"
            >
              <span className="text-[10px] font-bold text-ink-3 w-5">{i + 1}</span>
              <span className="flex-1 font-semibold text-ink">{p}</span>
              <button onClick={() => removePriority(i)} className="text-ink-3 hover:text-err p-1 rounded">
                <Icon name="close" size={13} />
              </button>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  )
}
