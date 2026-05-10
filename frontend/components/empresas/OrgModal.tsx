"use client"
import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { FormField, TextInput, PrimaryButton, SecondaryButton } from "@/components/ui/FormField"
import { Icon } from "@/components/Icon"
import { useRouter } from "next/navigation"
import type { Organization } from "@/lib/contacts-types"
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  enrichOrganization,
} from "@/lib/contacts-api"
import { PermissionGate } from "@/components/auth/PermissionGate"

type Mode =
  | { kind: "create" }
  | { kind: "edit"; org: Organization }

type FormState = {
  name: string
  trade_name: string
  cnpj: string
  industry: string
  website: string
  notes: string
}

const EMPTY: FormState = {
  name: "",
  trade_name: "",
  cnpj: "",
  industry: "",
  website: "",
  notes: "",
}

function maskCnpj(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function OrgModal({
  open,
  mode,
  onClose,
  onSaved,
  onDeleted,
}: {
  open: boolean
  mode: Mode
  onClose: () => void
  onSaved: (org: Organization) => void
  onDeleted?: (id: number) => void
}) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    setError(null)
    setConfirmDelete(false)
    if (mode.kind === "edit") {
      const o = mode.org
      setForm({
        name: o.name,
        trade_name: o.trade_name ?? "",
        cnpj: o.cnpj ?? "",
        industry: o.industry ?? "",
        website: o.website ?? "",
        notes: o.notes ?? "",
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, mode])

  const cnpjDigits = form.cnpj.replace(/\D/g, "")
  const cnpjValid = cnpjDigits.length === 0 || cnpjDigits.length === 14
  const canSubmit = form.name.trim().length > 0 && cnpjValid

  async function submit() {
    if (!canSubmit) {
      setError(form.name.trim() ? "CNPJ deve ter 14 dígitos" : "Nome é obrigatório")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        trade_name: form.trade_name.trim() || null,
        cnpj: cnpjDigits || null,
        industry: form.industry.trim() || null,
        website: form.website.trim() || null,
        notes: form.notes.trim() || null,
      }
      const saved = mode.kind === "edit"
        ? await updateOrganization(mode.org.id, payload)
        : await createOrganization(payload)
      onSaved(saved)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSubmitting(false)
    }
  }

  async function enrich() {
    if (mode.kind !== "edit") return
    if (!cnpjDigits || cnpjDigits.length !== 14) {
      setError("Salve a empresa com CNPJ antes de atualizar via Receita")
      return
    }
    setEnriching(true)
    setError(null)
    try {
      // Garante que o CNPJ atual está salvo antes de enriquecer
      let target = mode.org
      if (cnpjDigits !== (mode.org.cnpj ?? "")) {
        target = await updateOrganization(mode.org.id, { cnpj: cnpjDigits })
      }
      const fresh = await enrichOrganization(target.id)
      setForm({
        name: fresh.name,
        trade_name: fresh.trade_name ?? "",
        cnpj: fresh.cnpj ?? "",
        industry: fresh.industry ?? "",
        website: fresh.website ?? form.website,
        notes: fresh.notes ?? form.notes,
      })
      onSaved(fresh)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enriquecer")
    } finally {
      setEnriching(false)
    }
  }

  async function doDelete() {
    if (mode.kind !== "edit") return
    setSubmitting(true)
    try {
      await deleteOrganization(mode.org.id)
      onDeleted?.(mode.org.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao apagar")
    } finally {
      setSubmitting(false)
    }
  }

  function viewLinkedContacts() {
    if (mode.kind !== "edit") return
    router.push(`/contatos?organization_id=${mode.org.id}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode.kind === "edit" ? "Editar empresa" : "Nova empresa"}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {mode.kind === "edit" && (
              <PermissionGate module="empresas" action="deletar">
                {confirmDelete ? (
                  <div className="flex items-center gap-2 text-[11.5px]">
                    <span className="text-err font-semibold">Confirma apagar?</span>
                    <button
                      onClick={doDelete}
                      disabled={submitting}
                      className="px-2 py-1 rounded-md bg-red-50 border border-red-200 text-err font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      Sim, apagar
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="text-ink-3 hover:text-ink">
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
                )}
              </PermissionGate>
            )}
          </div>
          <div className="flex gap-2">
            <SecondaryButton onClick={onClose} disabled={submitting}>
              Cancelar
            </SecondaryButton>
            <PermissionGate module="empresas" action={mode.kind === "edit" ? "editar" : "criar"}>
              <PrimaryButton onClick={submit} disabled={submitting || !canSubmit}>
                {submitting ? "Salvando…" : "Salvar"}
              </PrimaryButton>
            </PermissionGate>
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
        <FormField label="Razão social / nome" required>
          <TextInput
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="PalharesTech Software Ltda"
          />
        </FormField>
        <FormField label="Nome fantasia">
          <TextInput
            value={form.trade_name}
            onChange={(e) => setForm({ ...form, trade_name: e.target.value })}
            placeholder="PalharesTech"
          />
        </FormField>
        <FormField label="CNPJ" hint={cnpjDigits && !cnpjValid ? `${cnpjDigits.length}/14 dígitos` : undefined}>
          <div className="flex gap-2">
            <TextInput
              value={maskCnpj(form.cnpj)}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
              className="flex-1"
            />
            {mode.kind === "edit" && cnpjValid && cnpjDigits.length === 14 && (
              <button
                type="button"
                onClick={enrich}
                disabled={enriching}
                className="text-[11px] font-semibold px-2 rounded border border-hair text-ink-2 hover:border-accent hover:text-accent disabled:opacity-50 transition-colors whitespace-nowrap"
                title="Buscar e atualizar dados via Receita"
              >
                {enriching ? "…" : "↻ Receita"}
              </button>
            )}
          </div>
        </FormField>
        <FormField label="Ramo / CNAE">
          <TextInput
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="Desenvolvimento de software"
          />
        </FormField>
        <FormField label="Website">
          <TextInput
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://palharestech.com"
          />
        </FormField>
        <FormField label="Contatos vinculados">
          <div className="flex items-center gap-2 bg-bg border border-hair rounded-md px-3 py-2">
            <Icon name="users" size={13} className="text-ink-3" />
            <span className="text-[12.5px] font-semibold text-ink tabular-nums">
              {mode.kind === "edit" ? mode.org.contact_count : 0}
            </span>
            {mode.kind === "edit" && mode.org.contact_count > 0 && (
              <button
                type="button"
                onClick={viewLinkedContacts}
                className="ml-auto text-[11px] font-semibold text-accent hover:text-accent-hover"
              >
                Ver contatos →
              </button>
            )}
          </div>
        </FormField>
      </div>

      <FormField label="Notas">
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={4}
          className="w-full bg-bg border border-hair rounded-md px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-y"
          placeholder="Markdown livre"
        />
      </FormField>

      {mode.kind === "edit" && mode.org.enriched_at && (
        <div className="text-[10.5px] text-ink-3 font-medium mt-1">
          Última atualização via Receita:{" "}
          {new Date(mode.org.enriched_at).toLocaleString("pt-BR")}
        </div>
      )}
    </Modal>
  )
}
