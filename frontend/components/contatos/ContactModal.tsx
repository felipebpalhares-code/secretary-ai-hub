"use client"
import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { FormField, TextInput, Select, PrimaryButton, SecondaryButton } from "@/components/ui/FormField"
import { TagInput } from "./TagInput"
import { OrganizationCombobox } from "./OrganizationCombobox"
import { Icon } from "@/components/Icon"
import type { Contact, Category, ContactCreate, Organization } from "@/lib/contacts-types"
import { createContact, updateContact, deleteContact } from "@/lib/contacts-api"

type Mode =
  | { kind: "create" }
  | { kind: "edit"; contact: Contact }

type FormState = {
  name: string
  email: string
  phone: string
  organization: Organization | null
  role: string
  category_id: number | null
  notes: string
  photo_url: string
  birthday: string
  is_starred: boolean
  tags: string[]
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  organization: null,
  role: "",
  category_id: null,
  notes: "",
  photo_url: "",
  birthday: "",
  is_starred: false,
  tags: [],
}

export function ContactModal({
  open,
  mode,
  categories,
  onClose,
  onSaved,
  onDeleted,
}: {
  open: boolean
  mode: Mode
  categories: Category[]
  onClose: () => void
  onSaved: (c: Contact) => void
  onDeleted?: (id: number) => void
}) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)
    setConfirmDelete(false)
    if (mode.kind === "edit") {
      const c = mode.contact
      setForm({
        name: c.name ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        organization: c.organization,
        role: c.role ?? "",
        category_id: c.category_id ?? null,
        notes: c.notes ?? "",
        photo_url: c.photo_url ?? "",
        birthday: c.birthday ?? "",
        is_starred: c.is_starred,
        tags: c.tags.map((t) => t.name),
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, mode])

  const localValid = !!(form.name.trim() || form.email.trim() || form.phone.trim())

  async function submit() {
    setError(null)
    if (!localValid) {
      setError("Informe ao menos nome, e-mail ou telefone")
      return
    }
    setSubmitting(true)
    try {
      const payload: ContactCreate = {
        name: form.name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        organization_id: form.organization?.id ?? null,
        role: form.role.trim() || null,
        category_id: form.category_id,
        notes: form.notes.trim() || null,
        photo_url: form.photo_url.trim() || null,
        birthday: form.birthday || null,
        is_starred: form.is_starred,
        tags: form.tags,
      }
      const saved = mode.kind === "edit"
        ? await updateContact(mode.contact.id, payload)
        : await createContact(payload)
      onSaved(saved)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar contato")
    } finally {
      setSubmitting(false)
    }
  }

  async function doDelete() {
    if (mode.kind !== "edit") return
    setSubmitting(true)
    try {
      await deleteContact(mode.contact.id)
      onDeleted?.(mode.contact.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao apagar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode.kind === "edit" ? "Editar contato" : "Novo contato"}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {mode.kind === "edit" && (
              confirmDelete ? (
                <div className="flex items-center gap-2 text-[11.5px]">
                  <span className="text-err font-semibold">Confirma apagar?</span>
                  <button
                    onClick={doDelete}
                    disabled={submitting}
                    className="px-2 py-1 rounded-md bg-red-50 border border-red-200 text-err font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    Sim, apagar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-ink-3 hover:text-ink"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-err hover:text-red-700 transition-colors"
                >
                  <Icon name="trash" size={12} />
                  Apagar
                </button>
              )
            )}
          </div>
          <div className="flex gap-2">
            <SecondaryButton onClick={onClose} disabled={submitting}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton onClick={submit} disabled={submitting || !localValid}>
              {submitting ? "Salvando…" : "Salvar"}
            </PrimaryButton>
          </div>
        </div>
      }
    >
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-err text-[11.5px] font-semibold px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4">
        <FormField label="Nome">
          <TextInput
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Felipe Palhares"
          />
        </FormField>
        <FormField label="Cargo">
          <TextInput
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="CEO, Advogado…"
          />
        </FormField>
        <FormField label="E-mail">
          <TextInput
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="exemplo@empresa.com"
          />
        </FormField>
        <FormField label="Telefone">
          <TextInput
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="11999998888"
          />
        </FormField>
        <FormField label="Categoria">
          <Select
            value={form.category_id ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                category_id: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">— Sem categoria —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Aniversário">
          <TextInput
            type="date"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
          />
        </FormField>
        <FormField label="Foto (URL externa)">
          <TextInput
            value={form.photo_url}
            onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
            placeholder="https://…"
          />
        </FormField>
      </div>

      <FormField label="Empresa">
        <OrganizationCombobox
          value={form.organization}
          onChange={(org) => setForm({ ...form, organization: org })}
        />
      </FormField>

      <FormField label="Tags" hint="Enter ou vírgula adiciona. Sugestões aparecem conforme você digita.">
        <TagInput value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
      </FormField>

      <FormField label="Notas">
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={4}
          className="w-full bg-bg border border-hair rounded-md px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-y"
          placeholder="Markdown livre — observações, contexto, lembretes…"
        />
      </FormField>
    </Modal>
  )
}
