"use client"
import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, DragEvent } from "react"
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
  extractIdentity,
  updateIdentity,
  type Identity,
  type IdentityDocumentKind,
} from "@/lib/api"
import { useIdentity } from "./identity-context"

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,application/pdf"

const DOC_KINDS: { value: IdentityDocumentKind; label: string }[] = [
  { value: "cnh", label: "CNH" },
  { value: "rg", label: "RG" },
  { value: "passport", label: "Passaporte" },
  { value: "other", label: "Outro" },
]

export function EditIdentityModal() {
  const { identity, isEditOpen, closeEdit, setIdentity } = useIdentity()
  const [form, setForm] = useState<Identity | null>(identity)
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractMsg, setExtractMsg] = useState<string | null>(null)
  const [docKind, setDocKind] = useState<IdentityDocumentKind>("cnh")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditOpen) {
      setForm(identity)
      setError(null)
      setExtractMsg(null)
    }
  }, [isEditOpen, identity])

  if (!form) return null

  const set =
    <K extends keyof Identity>(k: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => (f ? { ...f, [k]: e.target.value || null } : f))

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      const next = await updateIdentity(form)
      setIdentity(next)
      closeEdit()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function processFile(file: File) {
    setExtracting(true)
    setError(null)
    setExtractMsg(null)
    try {
      const res = await extractIdentity(file, docKind)
      const filled = Object.entries(res.extracted).filter(([, v]) => v != null)
      if (filled.length === 0) {
        setExtractMsg("Nenhum campo identificado no documento — preencha manualmente.")
      } else {
        setForm((f) =>
          f ? { ...f, ...(res.extracted as Partial<Identity>) } : f,
        )
        setExtractMsg(`${filled.length} campo(s) preenchido(s) automaticamente. Revise e salve.`)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao processar arquivo")
    } finally {
      setExtracting(false)
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
    e.target.value = ""
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  return (
    <Modal
      open={isEditOpen}
      onClose={closeEdit}
      title="Editar identidade"
      size="lg"
      footer={
        <>
          <SecondaryButton onClick={closeEdit} disabled={saving || extracting}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving || extracting}>
            {saving ? "Salvando…" : "Salvar"}
          </PrimaryButton>
        </>
      }
    >
      {/* ── Upload zone ────────────── */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`mb-5 border-2 border-dashed rounded-lg p-5 transition-colors ${
          dragActive
            ? "border-accent bg-accent-soft"
            : "border-hair bg-bg hover:border-ink-4"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-card border border-hair flex items-center justify-center text-accent shrink-0">
            <Icon name="zap" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-ink mb-0.5">
              Preencher automaticamente com IA
            </div>
            <div className="text-[11.5px] text-ink-3 leading-relaxed mb-3">
              Arraste uma foto da CNH, RG ou passaporte (JPG, PNG, PDF). A IA lê o
              documento e preenche os campos abaixo. Você revisa e salva.
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <label className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
                Tipo:
              </label>
              {DOC_KINDS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => setDocKind(k.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors ${
                    docKind === k.value
                      ? "bg-accent text-white border-accent"
                      : "bg-card text-ink-2 border-hair hover:border-ink-4"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              onChange={onFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={extracting}
                className="inline-flex items-center gap-1.5 bg-card border border-hair text-ink text-[12px] font-semibold px-3 py-1.5 rounded-md hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
              >
                <Icon name="file" size={13} />
                Escolher arquivo…
              </button>
              {extracting && (
                <span className="text-[11.5px] text-accent font-semibold">
                  Lendo documento com IA…
                </span>
              )}
              {extractMsg && !extracting && (
                <span className="text-[11.5px] text-emerald-700 font-semibold">
                  ✓ {extractMsg}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[12px] font-semibold px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* ── Form ────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-3">
            Informações gerais
          </div>
          <FormField label="Nome completo">
            <TextInput value={form.full_name ?? ""} onChange={set("full_name")} />
          </FormField>
          <FormField label="Apelido">
            <TextInput value={form.nickname ?? ""} onChange={set("nickname")} />
          </FormField>
          <FormField label="Nascimento">
            <TextInput type="date" value={form.birth_date ?? ""} onChange={set("birth_date")} />
          </FormField>
          <FormField label="Estado civil">
            <Select value={form.marital_status ?? ""} onChange={set("marital_status")}>
              <option value="">—</option>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="união estável">União estável</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viúvo">Viúvo(a)</option>
            </Select>
          </FormField>
          <FormField label="Religião">
            <TextInput value={form.religion ?? ""} onChange={set("religion")} />
          </FormField>
          <FormField label="Naturalidade">
            <TextInput value={form.birthplace ?? ""} onChange={set("birthplace")} />
          </FormField>
        </div>

        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-3">
            Documentos <span className="text-ink-3 normal-case font-normal">(criptografados)</span>
          </div>
          <FormField label="CPF">
            <TextInput
              value={form.cpf ?? ""}
              onChange={set("cpf")}
              placeholder="000.000.000-00"
            />
          </FormField>
          <FormField label="RG">
            <TextInput value={form.rg ?? ""} onChange={set("rg")} />
          </FormField>
          <FormField label="CNH — número">
            <TextInput value={form.cnh_number ?? ""} onChange={set("cnh_number")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="CNH — categoria">
              <Select value={form.cnh_category ?? ""} onChange={set("cnh_category")}>
                <option value="">—</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </Select>
            </FormField>
            <FormField label="CNH — validade">
              <TextInput type="date" value={form.cnh_expiry ?? ""} onChange={set("cnh_expiry")} />
            </FormField>
          </div>
          <FormField label="Passaporte — número">
            <TextInput value={form.passport_number ?? ""} onChange={set("passport_number")} />
          </FormField>
          <FormField label="Passaporte — validade">
            <TextInput
              type="date"
              value={form.passport_expiry ?? ""}
              onChange={set("passport_expiry")}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}
