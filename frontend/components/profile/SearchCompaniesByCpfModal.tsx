"use client"
import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { Icon } from "@/components/Icon"
import { Modal } from "@/components/ui/Modal"
import {
  FormField,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/FormField"
import {
  lookupCompaniesByCpf,
  lookupCnpj,
  createCompany,
  type Company,
  type CompanyByCpf,
  type CompanyInput,
} from "@/lib/api"
import { useIdentity } from "./identity-context"

/* ─── helpers ─── */

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "")
}

function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatCnpj(d: string): string {
  if (d.length !== 14) return d
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function isValidCpf(input: string): boolean {
  const d = onlyDigits(input)
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  let s1 = 0
  for (let i = 0; i < 9; i++) s1 += parseInt(d[i], 10) * (10 - i)
  let dv1 = 11 - (s1 % 11)
  if (dv1 >= 10) dv1 = 0
  if (dv1 !== parseInt(d[9], 10)) return false
  let s2 = 0
  for (let i = 0; i < 10; i++) s2 += parseInt(d[i], 10) * (11 - i)
  let dv2 = 11 - (s2 % 11)
  if (dv2 >= 10) dv2 = 0
  return dv2 === parseInt(d[10], 10)
}

function fmtDateBR(iso: string | null) {
  if (!iso) return null
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function prettifyQual(q: string | null): string | null {
  if (!q) return null
  return q
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

function maskUserCpf(cpf: string | null): string | null {
  if (!cpf) return null
  const d = onlyDigits(cpf)
  if (d.length !== 11) return null
  return `***.***.***-${d.slice(-2)}`
}

/* ─── tipos de estado ─── */

type Phase =
  | { kind: "input" }
  | { kind: "loading" }
  | { kind: "list"; results: CompanyByCpf[] }
  | { kind: "error"; message: string }
  | { kind: "creating"; total: number; done: number; failed: number }
  | { kind: "summary"; created: number; failed: number }

/* ─── componente ─── */

export function SearchCompaniesByCpfModal({
  open,
  onClose,
  existingCompanies,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  existingCompanies: Company[]
  onSaved: () => void
}) {
  const { identity } = useIdentity()
  const [cpfRaw, setCpfRaw] = useState("")
  const [phase, setPhase] = useState<Phase>({ kind: "input" })
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const userCpfDigits = identity?.cpf ? onlyDigits(identity.cpf) : null
  const userCpfMasked = maskUserCpf(identity?.cpf ?? null)
  const cpfDigits = onlyDigits(cpfRaw)
  const useUserCpfChecked = !!userCpfDigits && cpfDigits === userCpfDigits

  const existingCnpjs = new Set(
    existingCompanies
      .map((c) => onlyDigits(c.cnpj ?? ""))
      .filter((d) => d.length === 14),
  )

  // Reseta ao fechar
  useEffect(() => {
    if (open) {
      setCpfRaw("")
      setPhase({ kind: "input" })
      setSelected(new Set())
    }
  }, [open])

  function onCpfChange(e: ChangeEvent<HTMLInputElement>) {
    setCpfRaw(formatCpf(e.target.value))
  }

  function toggleUseUserCpf(checked: boolean) {
    if (!userCpfDigits) return
    setCpfRaw(checked ? formatCpf(userCpfDigits) : "")
  }

  async function handleSearch() {
    const digits = onlyDigits(cpfRaw)
    if (!isValidCpf(digits)) {
      setPhase({ kind: "error", message: "CPF inválido. Verifique os dígitos." })
      return
    }
    setPhase({ kind: "loading" })
    try {
      const results = await lookupCompaniesByCpf(digits)
      setSelected(new Set())
      setPhase({ kind: "list", results })
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : "Falha ao consultar"
      // O ApiError já mostra o detail — pegamos e limpamos
      const lower = raw.toLowerCase()
      let friendly: string
      if (lower.includes("cpf inválido") || lower.includes("invalido")) {
        friendly = "CPF inválido. Verifique os dígitos."
      } else if (lower.includes("indisponível") || lower.includes("503")) {
        friendly = "Serviço temporariamente indisponível."
      } else {
        friendly = "Não foi possível consultar a Receita. Tente novamente."
      }
      setPhase({ kind: "error", message: friendly })
    }
  }

  function backToInput() {
    setPhase({ kind: "input" })
  }

  function toggleSelect(cnpj: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(cnpj)) next.delete(cnpj)
      else next.add(cnpj)
      return next
    })
  }

  async function handleCreate() {
    if (phase.kind !== "list") return
    const toCreate = phase.results.filter((r) => selected.has(r.cnpj))
    if (toCreate.length === 0) return

    let done = 0
    let failed = 0
    setPhase({ kind: "creating", total: toCreate.length, done: 0, failed: 0 })

    for (const item of toCreate) {
      try {
        let enriched: Awaited<ReturnType<typeof lookupCnpj>> | null = null
        try {
          enriched = await lookupCnpj(item.cnpj)
        } catch {
          enriched = null
        }
        const input: CompanyInput = {
          name: item.razao_social ?? enriched?.razao_social ?? `Empresa ${item.cnpj}`,
          cnpj: item.cnpj,
          industry: enriched?.ramo ?? null,
          role: prettifyQual(item.qualificacao),
          ownership_pct: null,
          is_active: item.situacao === "active",
          systems: [],
          nome_fantasia: item.nome_fantasia ?? enriched?.nome_fantasia ?? null,
          capital_social: enriched?.capital_social ?? null,
          porte: enriched?.porte ?? null,
          natureza_juridica: enriched?.natureza_juridica ?? null,
          address_full: enriched?.address_full ?? null,
          municipio: enriched?.municipio ?? null,
          uf: enriched?.uf ?? null,
          cep: enriched?.cep ?? null,
          telefone: enriched?.telefone ?? null,
          email: enriched?.email ?? null,
          simples_nacional: enriched?.simples_nacional ?? false,
          mei: enriched?.mei ?? false,
        }
        await createCompany(input)
        done++
      } catch {
        failed++
      }
      setPhase({
        kind: "creating",
        total: toCreate.length,
        done: done + failed,
        failed,
      })
    }

    onSaved()
    setPhase({ kind: "summary", created: done, failed })
  }

  /* ─── renders ─── */

  function renderBody() {
    if (phase.kind === "input" || phase.kind === "error") {
      return (
        <>
          <div className="text-[12.5px] text-ink-2 font-medium mb-4">
            Digite um CPF para consultar empresas vinculadas na Receita Federal.
          </div>

          {phase.kind === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-[12.5px] font-semibold px-3 py-2 rounded mb-3">
              {phase.message}
            </div>
          )}

          <FormField
            label="CPF"
            hint="Usaremos a API CPF.CNPJ para a consulta. O CPF não é armazenado."
          >
            <input
              type="text"
              inputMode="numeric"
              value={cpfRaw}
              onChange={onCpfChange}
              placeholder="000.000.000-00"
              className="w-full bg-bg border border-hair rounded-md px-4 py-3 text-[16px] text-ink mono tracking-[.05em] placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              autoFocus
            />
          </FormField>

          {userCpfMasked && (
            <label className="flex items-center gap-2 cursor-pointer mt-2 select-none">
              <input
                type="checkbox"
                checked={useUserCpfChecked}
                onChange={(e) => toggleUseUserCpf(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-[11.5px] font-medium text-ink-2">
                Usar meu CPF cadastrado{" "}
                <span className="mono text-ink-3">({userCpfMasked})</span>
              </span>
            </label>
          )}
        </>
      )
    }

    if (phase.kind === "loading") {
      return (
        <div className="text-center py-12">
          <div className="text-accent inline-flex items-center gap-2">
            <SpinnerIcon />
            <span className="text-[12.5px] font-semibold">
              Consultando empresas vinculadas ao CPF…
            </span>
          </div>
          <div className="text-[11px] text-ink-3 mt-2 font-medium">via CPF.CNPJ</div>
        </div>
      )
    }

    if (phase.kind === "list" && phase.results.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full bg-bg border border-hair flex items-center justify-center text-ink-3 mx-auto mb-3">
            <Icon name="file" size={20} />
          </div>
          <div className="text-[13px] font-bold text-ink mb-1">
            Nenhuma empresa encontrada vinculada a este CPF.
          </div>
        </div>
      )
    }

    if (phase.kind === "list") {
      return (
        <>
          <div className="text-[12.5px] font-semibold text-ink mb-3">
            Encontramos {phase.results.length} empresa(s). Selecione quais cadastrar:
          </div>
          <div className="border border-hair rounded-md overflow-hidden bg-card">
            {phase.results.map((r) => {
              const already = existingCnpjs.has(r.cnpj)
              const isSelected = selected.has(r.cnpj)
              return (
                <label
                  key={r.cnpj}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-hair-2 last:border-b-0 ${
                    already ? "bg-bg cursor-not-allowed" : "cursor-pointer hover:bg-bg"
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={already}
                    checked={!already && isSelected}
                    onChange={() => toggleSelect(r.cnpj)}
                    className="mt-1 accent-accent"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold text-ink text-[12.5px]">
                        {r.razao_social ?? "—"}
                      </div>
                      {r.situacao === "active" ? (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                          Ativa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                          Baixada/Inativa
                        </span>
                      )}
                      {already && (
                        <span className="text-[10px] font-bold bg-hair-2 text-ink-3 border border-hair px-2 py-0.5 rounded">
                          já cadastrada
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-3 mt-1 font-medium flex flex-wrap gap-3">
                      <span className="mono">CNPJ {formatCnpj(r.cnpj)}</span>
                      {r.qualificacao && <span>{prettifyQual(r.qualificacao)}</span>}
                      {r.data_entrada && (
                        <span>desde {fmtDateBR(r.data_entrada)}</span>
                      )}
                      {r.nome_fantasia && (
                        <span className="text-ink-2">&ldquo;{r.nome_fantasia}&rdquo;</span>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </>
      )
    }

    if (phase.kind === "creating") {
      return (
        <div className="text-center py-12">
          <div className="text-accent inline-flex items-center gap-2 mb-3">
            <SpinnerIcon />
            <span className="text-[12.5px] font-semibold">
              Cadastrando {phase.done} de {phase.total}…
            </span>
          </div>
          <div className="h-[3px] bg-hair-2 rounded-full overflow-hidden max-w-sm mx-auto">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(phase.done / phase.total) * 100}%` }}
            />
          </div>
          {phase.failed > 0 && (
            <div className="text-[11px] text-amber-700 font-semibold mt-2">
              {phase.failed} falharam até agora
            </div>
          )}
        </div>
      )
    }

    if (phase.kind === "summary") {
      return (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-ok mx-auto mb-3">
            <Icon name="check" size={22} />
          </div>
          <div className="text-[13px] font-bold text-ink">
            {phase.created} empresa(s) cadastrada(s)
          </div>
          {phase.failed > 0 && (
            <div className="text-[11.5px] text-amber-700 font-semibold mt-1">
              {phase.failed} falharam — você pode tentar de novo manualmente.
            </div>
          )}
        </div>
      )
    }

    return null
  }

  function renderFooter() {
    if (phase.kind === "input") {
      const ready = cpfDigits.length === 11
      return (
        <>
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton onClick={handleSearch} disabled={!ready}>
            Buscar
          </PrimaryButton>
        </>
      )
    }
    if (phase.kind === "loading") {
      return <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
    }
    if (phase.kind === "error") {
      return (
        <>
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton onClick={backToInput}>Tentar novamente</PrimaryButton>
        </>
      )
    }
    if (phase.kind === "list" && phase.results.length === 0) {
      return <PrimaryButton onClick={backToInput}>Buscar outro CPF</PrimaryButton>
    }
    if (phase.kind === "list") {
      const count = Array.from(selected).filter((c) => !existingCnpjs.has(c)).length
      return (
        <>
          <SecondaryButton onClick={backToInput}>Voltar</SecondaryButton>
          <PrimaryButton onClick={handleCreate} disabled={count === 0}>
            Cadastrar {count > 0 ? `${count} selecionada(s)` : "selecionadas"}
          </PrimaryButton>
        </>
      )
    }
    if (phase.kind === "summary") {
      return <PrimaryButton onClick={onClose}>Fechar</PrimaryButton>
    }
    return null
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buscar empresas pelo CPF"
      size="lg"
      footer={renderFooter()}
    >
      {renderBody()}
    </Modal>
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
