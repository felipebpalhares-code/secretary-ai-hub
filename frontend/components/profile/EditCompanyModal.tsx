"use client"
import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { Icon } from "@/components/Icon"
import { Modal } from "@/components/ui/Modal"
import {
  FormField,
  TextInput,
  Select,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/FormField"
import {
  createCompany,
  lookupCnpj,
  updateCompany,
  type Company,
  type CompanyInput,
  type CnpjQsaItem,
} from "@/lib/api"
import { useIdentity } from "./identity-context"

const empty: CompanyInput = {
  name: "",
  cnpj: null,
  industry: null,
  role: null,
  ownership_pct: null,
  is_active: true,
  systems: [],
  nome_fantasia: null,
  capital_social: null,
  porte: null,
  natureza_juridica: null,
  address_full: null,
  municipio: null,
  uf: null,
  cep: null,
  telefone: null,
  email: null,
  simples_nacional: false,
  mei: false,
}

type MatchInfo =
  | { kind: "matched"; qual: string | null; percentual: number | null }
  | { kind: "not_partner" }
  | { kind: "no_qsa" }
  | { kind: "no_user_cpf" }

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; match: MatchInfo; source: string }
  | { kind: "error"; message: string }

function onlyDigits(v: string | null | undefined) {
  return (v ?? "").replace(/\D/g, "")
}

/**
 * Compara CPF do usuário (texto plano, 11 dígitos) com a versão mascarada
 * que vem da BrasilAPI (ex: "***.456.789-**" ou "***456789**").
 * Considera match quando todos os dígitos visíveis batem nas mesmas posições.
 */
function cpfMatchesMasked(userCpf: string, masked: string): boolean {
  const userDigits = userCpf.replace(/\D/g, "")
  if (userDigits.length !== 11) return false
  const cleaned = masked.replace(/[^\d*]/g, "") // mantém só dígitos e *
  if (cleaned.length !== 11) return false
  for (let i = 0; i < 11; i++) {
    if (cleaned[i] === "*") continue
    if (cleaned[i] !== userDigits[i]) return false
  }
  return true
}

function findUserMatch(qsa: CnpjQsaItem[], userCpf: string | null): MatchInfo {
  if (!userCpf) return { kind: "no_user_cpf" }
  if (!qsa.length) return { kind: "no_qsa" }
  const found = qsa.find(
    (s) => s.cpf_cnpj_mascarado && cpfMatchesMasked(userCpf, s.cpf_cnpj_mascarado),
  )
  if (found) return { kind: "matched", qual: found.qual, percentual: found.percentual }
  return { kind: "not_partner" }
}

export function EditCompanyModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: Company | null
  onSaved: () => void
}) {
  const { identity } = useIdentity()
  const [form, setForm] = useState<CompanyInput>(empty)
  const [systemDraft, setSystemDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookup, setLookup] = useState<LookupState>({ kind: "idle" })
  const lastLookupCnpj = useRef<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : empty)
      setSystemDraft("")
      setError(null)
      setLookup({ kind: "idle" })
      lastLookupCnpj.current = onlyDigits(initial?.cnpj)
    }
  }, [open, initial])

  // Auto-lookup do CNPJ com debounce 500ms quando atinge 14 dígitos
  useEffect(() => {
    if (!open) return
    const digits = onlyDigits(form.cnpj)
    if (digits.length !== 14) {
      if (lookup.kind === "loading") setLookup({ kind: "idle" })
      return
    }
    if (digits === lastLookupCnpj.current && lookup.kind === "ok") return

    const userCpf = identity?.cpf ?? null

    const id = setTimeout(async () => {
      lastLookupCnpj.current = digits
      setLookup({ kind: "loading" })
      try {
        const data = await lookupCnpj(digits)
        const match = findUserMatch(data.qsa, userCpf)
        setForm((f) => ({
          ...f,
          name: data.razao_social ?? f.name,
          industry: data.ramo ?? f.industry,
          is_active: data.status === "active",
          ownership_pct:
            match.kind === "matched" && match.percentual != null
              ? match.percentual
              : f.ownership_pct,
          nome_fantasia: data.nome_fantasia ?? f.nome_fantasia,
          capital_social: data.capital_social ?? f.capital_social,
          porte: data.porte ?? f.porte,
          natureza_juridica: data.natureza_juridica ?? f.natureza_juridica,
          address_full: data.address_full ?? f.address_full,
          municipio: data.municipio ?? f.municipio,
          uf: data.uf ?? f.uf,
          cep: data.cep ?? f.cep,
          telefone: data.telefone ?? f.telefone,
          email: data.email ?? f.email,
          simples_nacional: data.simples_nacional,
          mei: data.mei,
        }))
        setLookup({ kind: "ok", match, source: data.source })
      } catch {
        setLookup({
          kind: "error",
          message: "Não foi possível buscar dados da Receita — preencha manualmente.",
        })
      }
    }, 500)

    return () => clearTimeout(id)
  }, [form.cnpj, open, lookup.kind, identity?.cpf])

  function setField<K extends keyof CompanyInput>(key: K, value: CompanyInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onCnpjChange(e: ChangeEvent<HTMLInputElement>) {
    setField("cnpj", e.target.value || null)
    if (lookup.kind === "error" || lookup.kind === "ok") {
      setLookup({ kind: "idle" })
    }
  }

  function addSystem() {
    const v = systemDraft.trim()
    if (!v) return
    setForm((f) => ({ ...f, systems: [...f.systems, v] }))
    setSystemDraft("")
  }

  function removeSystem(idx: number) {
    setForm((f) => ({ ...f, systems: f.systems.filter((_, i) => i !== idx) }))
  }

  function onSystemKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addSystem()
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Nome da empresa é obrigatório")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload: CompanyInput = {
        ...form,
        cnpj: form.cnpj?.toString().trim() || null,
      }
      if (initial) await updateCompany(initial.id, payload)
      else await createCompany(payload)
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
      title={initial ? "Editar empresa" : "Nova empresa"}
      size="lg"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={saving}>
            Cancelar
          </SecondaryButton>
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

      <PartnerMatchBanner state={lookup} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormField label="Razão social / Nome" required>
            <TextInput
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)}
            />
          </FormField>
          <FormField
            label="CNPJ"
            hint={
              lookup.kind === "loading"
                ? undefined
                : lookup.kind === "ok"
                  ? "Dados preenchidos pela Receita Federal."
                  : lookup.kind === "error"
                    ? lookup.message
                    : "Ao digitar 14 dígitos, busca automaticamente na Receita."
            }
          >
            <div className="relative">
              <TextInput
                value={form.cnpj ?? ""}
                onChange={onCnpjChange}
                placeholder="00.000.000/0000-00"
                className="pr-9"
              />
              {lookup.kind === "loading" && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-accent">
                  <SpinnerIcon />
                </span>
              )}
              {lookup.kind === "ok" && (
                <span
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600"
                  aria-label="CNPJ verificado"
                  title="Dados da Receita preenchidos"
                >
                  <Icon name="check" size={14} />
                </span>
              )}
            </div>
          </FormField>
          <FormField label="Ramo">
            <TextInput
              value={form.industry ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("industry", e.target.value || null)
              }
              placeholder="Tecnologia, Distribuição…"
            />
          </FormField>
          <FormField label="Cargo">
            <TextInput
              value={form.role ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("role", e.target.value || null)
              }
              placeholder="CEO, Sócio Administrador…"
            />
          </FormField>
        </div>
        <div>
          <FormField label="Participação (%)">
            <TextInput
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={form.ownership_pct ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("ownership_pct", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </FormField>
          <FormField label="Status">
            <Select
              value={form.is_active ? "active" : "inactive"}
              onChange={(e) => setField("is_active", e.target.value === "active")}
            >
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </Select>
          </FormField>
          <FormField label="Sistemas usados" hint="ERP, CRM, ferramentas. Enter ou clique no + para adicionar.">
            <div className="flex gap-2">
              <TextInput
                value={systemDraft}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSystemDraft(e.target.value)}
                onKeyDown={onSystemKey}
                placeholder="SAP, Salesforce, TOTVS…"
              />
              <button
                type="button"
                onClick={addSystem}
                className="bg-card border border-hair text-ink px-3 py-2 rounded-md text-[12px] font-semibold hover:border-accent hover:text-accent transition-colors"
              >
                <Icon name="plus" size={14} />
              </button>
            </div>
            {form.systems.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.systems.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="inline-flex items-center gap-1 bg-hair-2 text-ink-2 border border-hair px-2 py-0.5 rounded text-[11px] font-semibold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSystem(i)}
                      className="hover:text-err"
                      aria-label={`Remover ${s}`}
                    >
                      <Icon name="close" size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormField>
        </div>
      </div>

      <ReceitaSection form={form} sourceLabel={lookup.kind === "ok" ? lookup.source : null} />
    </Modal>
  )
}

function PartnerMatchBanner({ state }: { state: LookupState }) {
  if (state.kind !== "ok") return null
  if (state.match.kind === "matched") {
    return (
      <div className="bg-accent-soft border border-indigo-200 text-accent text-[11.5px] font-semibold px-3 py-2 rounded mb-4">
        Sócio identificado: {state.match.qual ?? "—"}
        {state.match.percentual == null && (
          <span className="block font-medium mt-0.5 text-[11px]">
            Percentual não informado pela Receita — preencha abaixo se souber.
          </span>
        )}
        {state.match.percentual != null && (
          <span className="block font-medium mt-0.5 text-[11px]">
            Participação ({state.match.percentual}%) preenchida pela Receita.
          </span>
        )}
      </div>
    )
  }
  if (state.match.kind === "not_partner") {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11.5px] font-semibold px-3 py-2 rounded mb-4">
        Você não consta como sócio nesta empresa na Receita Federal. Preencha participação manualmente se aplicável.
      </div>
    )
  }
  if (state.match.kind === "no_user_cpf") {
    return (
      <div className="bg-hair-2 border border-hair text-ink-2 text-[11.5px] font-medium px-3 py-2 rounded mb-4">
        Cadastre seu CPF na aba Identidade pra que o hub identifique automaticamente em quais empresas você é sócio.
      </div>
    )
  }
  return null
}

function fmtBRL(v: number | null): string {
  if (v == null || isNaN(v)) return "—"
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
}

const SOURCE_LABEL: Record<string, string> = {
  brasilapi: "BrasilAPI",
  opencnpj: "OpenCNPJ",
}

function ReceitaSection({
  form,
  sourceLabel,
}: {
  form: CompanyInput
  sourceLabel: string | null
}) {
  // Só mostra se tem ao menos um dado da Receita preenchido
  const hasData =
    form.nome_fantasia ||
    form.capital_social != null ||
    form.porte ||
    form.natureza_juridica ||
    form.address_full ||
    form.municipio ||
    form.telefone ||
    form.email ||
    form.simples_nacional ||
    form.mei

  if (!hasData) return null

  const source = sourceLabel ? (SOURCE_LABEL[sourceLabel] ?? sourceLabel) : null

  return (
    <div className="mt-5 pt-5 border-t border-hair">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
          Dados da Receita Federal
        </div>
        {source && (
          <span className="text-[10px] font-semibold text-ink-3 bg-bg border border-hair px-2 py-0.5 rounded">
            via {source}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-bg border border-hair rounded-md p-4 text-[12px]">
        {form.nome_fantasia && (
          <Field label="Nome fantasia" value={form.nome_fantasia} />
        )}
        {form.capital_social != null && (
          <Field label="Capital social" value={fmtBRL(form.capital_social)} mono />
        )}
        {form.porte && <Field label="Porte" value={form.porte} />}
        {form.natureza_juridica && (
          <Field label="Natureza jurídica" value={form.natureza_juridica} />
        )}
        {form.address_full && (
          <Field label="Endereço" value={form.address_full} colSpan={2} />
        )}
        {(form.municipio || form.uf) && (
          <Field label="Cidade / UF" value={`${form.municipio ?? ""}${form.uf ? " — " + form.uf : ""}`} />
        )}
        {form.cep && <Field label="CEP" value={form.cep} mono />}
        {form.telefone && <Field label="Telefone" value={form.telefone} mono />}
        {form.email && <Field label="E-mail" value={form.email} />}
        {(form.simples_nacional || form.mei) && (
          <div className="col-span-2 flex gap-1.5 mt-1">
            {form.simples_nacional && (
              <span className="text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                Simples Nacional
              </span>
            )}
            {form.mei && (
              <span className="text-[10.5px] font-bold bg-accent-soft text-accent border border-indigo-200 px-2 py-0.5 rounded">
                MEI
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  colSpan,
}: {
  label: string
  value: string
  mono?: boolean
  colSpan?: number
}) {
  return (
    <div className={colSpan === 2 ? "col-span-2" : ""}>
      <div className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em]">{label}</div>
      <div className={`text-ink font-semibold mt-0.5 ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" strokeOpacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}
