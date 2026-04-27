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
  createVaultEntry,
  updateVaultEntry,
  type VaultCategory,
  type VaultEntry,
  type VaultEntryInput,
} from "@/lib/api"

const empty: VaultEntryInput = {
  category: "gov",
  name: "",
  username: null,
  password: null,
  url: null,
  notes: null,
}

const CATEGORIES: { value: VaultCategory; label: string }[] = [
  { value: "gov", label: "Governamental" },
  { value: "bank", label: "Bancário" },
  { value: "system", label: "Sistema / app" },
]

export function EditVaultEntryModal({
  open,
  onClose,
  initial,
  defaultCategory = "gov",
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: VaultEntry | null
  defaultCategory?: VaultCategory
  onSaved: () => void
}) {
  const [form, setForm] = useState<VaultEntryInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          category: initial.category,
          name: initial.name,
          username: initial.username,
          password: null,   // não vem na listagem; deixar vazio mantém senha
          url: initial.url,
          notes: initial.notes,
        })
      } else {
        setForm({ ...empty, category: defaultCategory })
      }
      setError(null)
      setShowPwd(false)
    }
  }, [open, initial, defaultCategory])

  function setField<K extends keyof VaultEntryInput>(key: K, value: VaultEntryInput[K]) {
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
      if (initial) await updateVaultEntry(initial.id, form)
      else await createVaultEntry(form)
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
      title={initial ? "Editar acesso" : "Novo acesso"}
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
          <Select value={form.category}
            onChange={(e) => setField("category", e.target.value as VaultCategory)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </FormField>
        <FormField label="Nome" required hint="Ex: e-CAC, Itaú PJ, Salesforce">
          <TextInput value={form.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Usuário / login">
        <TextInput value={form.username ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("username", e.target.value || null)} />
      </FormField>
      <FormField
        label={initial ? "Senha (deixe vazio pra manter)" : "Senha"}
        hint="Criptografada com AES-256 antes de salvar"
      >
        <div className="flex gap-2">
          <TextInput
            type={showPwd ? "text" : "password"}
            value={form.password ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("password", e.target.value || null)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="bg-card border border-hair text-ink-2 px-3 py-2 rounded-md text-[11px] font-semibold hover:border-ink-4 transition-colors"
          >
            {showPwd ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </FormField>
      <FormField label="URL">
        <TextInput value={form.url ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("url", e.target.value || null)}
          placeholder="https://…" />
      </FormField>
      <FormField label="Notas">
        <TextInput value={form.notes ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField("notes", e.target.value || null)} />
      </FormField>
    </Modal>
  )
}
