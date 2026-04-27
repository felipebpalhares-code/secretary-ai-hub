"use client"
import { useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Modal } from "@/components/ui/Modal"
import { PrimaryButton, SecondaryButton } from "@/components/ui/FormField"
import {
  lookupCompaniesByCpf,
  lookupCnpj,
  createCompany,
  type Company,
  type CompanyByCpf,
  type CompanyInput,
} from "@/lib/api"

type State =
  | { kind: "loading" }
  | { kind: "list"; results: CompanyByCpf[] }
  | { kind: "creating"; total: number; done: number; failed: number }
  | { kind: "summary"; created: number; failed: number; skipped: number }
  | { kind: "error"; message: string }

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
  const [state, setState] = useState<State>({ kind: "loading" })
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const existingCnpjs = new Set(
    existingCompanies
      .map((c) => (c.cnpj ?? "").replace(/\D/g, ""))
      .filter((d) => d.length === 14),
  )

  useEffect(() => {
    if (!open) return
    setState({ kind: "loading" })
    setSelected(new Set())
    lookupCompaniesByCpf()
      .then((results) => setState({ kind: "list", results }))
      .catch((e: unknown) =>
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : "Falha ao buscar empresas",
        }),
      )
  }, [open])

  function toggle(cnpj: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(cnpj)) next.delete(cnpj)
      else next.add(cnpj)
      return next
    })
  }

  async function handleCreate() {
    if (state.kind !== "list") return
    const toCreate = state.results.filter((r) => selected.has(r.cnpj))
    if (toCreate.length === 0) return

    let done = 0
    let failed = 0
    setState({ kind: "creating", total: toCreate.length, done: 0, failed: 0 })

    for (const item of toCreate) {
      try {
        // Enriquece com BrasilAPI (preenche ramo, capital social, endereço, etc.)
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
      setState({
        kind: "creating",
        total: toCreate.length,
        done: done + failed,
        failed,
      })
    }

    onSaved()
    setState({
      kind: "summary",
      created: done,
      failed,
      skipped: 0,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buscar empresas pelo CPF"
      size="lg"
      footer={renderFooter()}
    >
      {state.kind === "loading" && (
        <div className="text-center py-10">
          <div className="text-accent inline-flex items-center gap-2">
            <SpinnerIcon />
            <span className="text-[12.5px] font-semibold">
              Consultando empresas vinculadas ao seu CPF…
            </span>
          </div>
          <div className="text-[11px] text-ink-3 mt-2 font-medium">via CPF.CNPJ</div>
        </div>
      )}

      {state.kind === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[12.5px] font-semibold px-4 py-3 rounded">
          {state.message}
        </div>
      )}

      {state.kind === "list" && state.results.length === 0 && (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full bg-bg border border-hair flex items-center justify-center text-ink-3 mx-auto mb-3">
            <Icon name="search" size={20} />
          </div>
          <div className="text-[13px] font-bold text-ink mb-1">
            Nenhuma empresa vinculada a este CPF foi encontrada
          </div>
          <div className="text-[11.5px] text-ink-3 font-medium max-w-md mx-auto">
            A Receita Federal não retornou empresas em que você é sócio ou administrador.
          </div>
        </div>
      )}

      {state.kind === "list" && state.results.length > 0 && (
        <>
          <div className="text-[12.5px] font-semibold text-ink mb-3">
            Encontramos {state.results.length} empresa(s). Selecione quais cadastrar:
          </div>
          <div className="border border-hair rounded-md overflow-hidden bg-card">
            {state.results.map((r) => {
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
                    onChange={() => toggle(r.cnpj)}
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
      )}

      {state.kind === "creating" && (
        <div className="text-center py-10">
          <div className="text-accent inline-flex items-center gap-2 mb-3">
            <SpinnerIcon />
            <span className="text-[12.5px] font-semibold">
              Cadastrando {state.done} de {state.total}…
            </span>
          </div>
          <div className="h-[3px] bg-hair-2 rounded-full overflow-hidden max-w-sm mx-auto">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(state.done / state.total) * 100}%` }}
            />
          </div>
          {state.failed > 0 && (
            <div className="text-[11px] text-amber-700 font-semibold mt-2">
              {state.failed} falharam até agora
            </div>
          )}
        </div>
      )}

      {state.kind === "summary" && (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-ok mx-auto mb-3">
            <Icon name="check" size={22} />
          </div>
          <div className="text-[13px] font-bold text-ink">
            {state.created} empresa(s) cadastrada(s)
          </div>
          {state.failed > 0 && (
            <div className="text-[11.5px] text-amber-700 font-semibold mt-1">
              {state.failed} falharam — você pode tentar de novo manualmente.
            </div>
          )}
        </div>
      )}
    </Modal>
  )

  function renderFooter() {
    if (state.kind === "list" && state.results.length > 0) {
      const count = Array.from(selected).filter((c) => !existingCnpjs.has(c)).length
      return (
        <>
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton onClick={handleCreate} disabled={count === 0}>
            Cadastrar {count > 0 ? `${count} selecionada(s)` : "selecionadas"}
          </PrimaryButton>
        </>
      )
    }
    if (state.kind === "summary" || state.kind === "error" || (state.kind === "list" && state.results.length === 0)) {
      return <PrimaryButton onClick={onClose}>Fechar</PrimaryButton>
    }
    return null
  }
}

function formatCnpj(d: string): string {
  if (d.length !== 14) return d
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
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
