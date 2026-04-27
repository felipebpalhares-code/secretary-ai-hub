"use client"
import { useCallback, useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { FieldRow } from "@/components/ui/FieldRow"
import {
  listLegalCases,
  deleteLegalCase,
  listContracts,
  deleteContract,
  type LegalCase,
  type Contract,
} from "@/lib/api"
import {
  AddBtn,
  DeleteBtn,
  EditBtn,
  EmptyState,
  ErrorBanner,
  LoadingPlaceholder,
  SectionHdr,
  confirmDelete,
  daysUntil,
  fmtDateBR,
} from "./_shared"
import { EditLegalCaseModal } from "./EditLegalCaseModal"
import { EditContractModal } from "./EditContractModal"

function deadlineBadge(iso: string | null) {
  const d = daysUntil(iso)
  if (d === null) return null
  if (d < 0) return { variant: "red" as const, label: `${Math.abs(d)} dias atrasado` }
  if (d <= 7) return { variant: "red" as const, label: `${fmtDateBR(iso)} — ${d}d` }
  if (d <= 30) return { variant: "amber" as const, label: `${fmtDateBR(iso)} — ${d}d` }
  return { variant: "gray" as const, label: fmtDateBR(iso) }
}

function Banner({
  variant,
  children,
}: {
  variant: "danger" | "warn"
  children: React.ReactNode
}) {
  const cls = {
    danger: "bg-red-50 text-red-800 border-red-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
  }[variant]
  return (
    <div className={`flex items-center gap-[10px] px-[14px] py-[10px] rounded-md font-semibold border text-[12.5px] mb-2 ${cls}`}>
      {children}
    </div>
  )
}

export function JuridicoTab() {
  const [cases, setCases] = useState<LegalCase[] | null>(null)
  const [contracts, setContracts] = useState<Contract[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [caseModal, setCaseModal] = useState<{ open: boolean; initial: LegalCase | null }>({
    open: false, initial: null,
  })
  const [contractModal, setContractModal] = useState<{ open: boolean; initial: Contract | null }>({
    open: false, initial: null,
  })

  const reload = useCallback(async () => {
    setError(null)
    try {
      const [c, k] = await Promise.all([listLegalCases(), listContracts()])
      setCases(c)
      setContracts(k)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar jurídico")
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  if (cases === null || contracts === null) return <LoadingPlaceholder />
  if (error) return <ErrorBanner message={error} />

  const activeCases = cases.filter((c) => c.status === "active")
  const closedCases = cases.filter((c) => c.status === "closed")

  // Banners de alerta
  const urgentCase = activeCases.find((c) => {
    const d = daysUntil(c.next_deadline)
    return d !== null && d >= 0 && d <= 14
  })
  const expiringContract = contracts.find((c) => {
    const d = daysUntil(c.expiry_date)
    return d !== null && d >= 0 && d <= 60
  })

  return (
    <>
      {urgentCase && (
        <Banner variant="danger">
          Prazo processual em <strong className="mx-1">{daysUntil(urgentCase.next_deadline)} dias</strong>
          — Proc. {urgentCase.case_number}
          {urgentCase.lawyer_name && ` · ${urgentCase.lawyer_name}`}
        </Banner>
      )}
      {expiringContract && (
        <Banner variant="warn">
          Contrato &ldquo;{expiringContract.type}&rdquo; vence em
          <strong className="mx-1">{daysUntil(expiringContract.expiry_date)} dias</strong>
          — renovar ou rescindir
        </Banner>
      )}

      {/* Processos ativos */}
      <div>
        <SectionHdr
          title="Processos ativos"
          action={<AddBtn label="Novo processo" onClick={() => setCaseModal({ open: true, initial: null })} />}
        />
        {activeCases.length === 0 ? (
          <EmptyState icon="shield" title="Nenhum processo ativo" subtitle="Cadastre processos pra receber alertas de prazos automaticamente." />
        ) : (
          activeCases.map((c) => {
            const badge = deadlineBadge(c.next_deadline)
            const borderL = badge?.variant === "red" ? "border-l-err" : badge?.variant === "amber" ? "border-l-warn" : "border-l-hair"
            return (
              <div key={c.id} className={`bg-card border border-hair border-l-[3px] ${borderL} rounded-lg p-4 mb-[10px]`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
                    {c.case_type ?? "Processo"}
                  </div>
                  <Badge variant={badge?.variant === "red" ? "red" : badge?.variant === "amber" ? "amber" : "gray"}>
                    {c.status === "active" ? "Em andamento" : "Encerrado"}
                  </Badge>
                </div>
                <div className="text-[10.5px] font-semibold text-ink-3 mono">Nº {c.case_number}</div>
                <div className="grid grid-cols-2 gap-3 mt-[10px]">
                  <div>
                    <FieldRow label="Vara">{c.court ?? "—"}</FieldRow>
                    <FieldRow label="Tipo">{c.case_type ?? "—"}</FieldRow>
                  </div>
                  <div>
                    <FieldRow label="Advogado">
                      {c.lawyer_name ?? "—"}
                      {c.lawyer_oab && ` · ${c.lawyer_oab}`}
                    </FieldRow>
                    <FieldRow label="Próx. prazo">
                      {badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : "—"}
                    </FieldRow>
                  </div>
                </div>
                {c.notes && <div className="text-[11.5px] text-ink-3 mt-2 font-medium">{c.notes}</div>}
                <div className="flex gap-2 mt-3">
                  <EditBtn onClick={() => setCaseModal({ open: true, initial: c })} />
                  <DeleteBtn onClick={async () => {
                    if (!confirmDelete(c.case_number)) return
                    await deleteLegalCase(c.id); await reload()
                  }} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Processos encerrados */}
      {closedCases.length > 0 && (
        <div>
          <SectionHdr title={`Processos encerrados (${closedCases.length})`} />
          <div className="border border-hair rounded-md overflow-hidden bg-card">
            {closedCases.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-hair-2 last:border-b-0 text-[12px]">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink">{c.case_type ?? "Processo"} · {c.case_number}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5 font-medium">
                    {c.outcome ?? "—"} {c.closed_date && `· encerrado ${fmtDateBR(c.closed_date)}`}
                  </div>
                </div>
                <Badge variant="gray">Encerrado</Badge>
                <button onClick={() => setCaseModal({ open: true, initial: c })} className="text-ink-3 hover:text-accent p-1 rounded">
                  <Icon name="edit" size={13} />
                </button>
                <button
                  onClick={async () => {
                    if (!confirmDelete(c.case_number)) return
                    await deleteLegalCase(c.id); await reload()
                  }}
                  className="text-ink-3 hover:text-err p-1 rounded"
                >
                  <Icon name="close" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contratos */}
      <div>
        <SectionHdr
          title="Contratos importantes"
          action={<AddBtn label="Novo contrato" onClick={() => setContractModal({ open: true, initial: null })} />}
        />
        {contracts.length === 0 ? (
          <EmptyState icon="file" title="Nenhum contrato cadastrado" subtitle="Locação, prestação de serviços, parcerias — tudo que tem prazo e renovação." />
        ) : (
          <div className="border border-hair rounded-md overflow-hidden bg-card">
            {contracts.map((c) => {
              const d = daysUntil(c.expiry_date)
              const variant = d == null ? "gray" : d < 0 ? "red" : d <= 60 ? "amber" : "green"
              const label = c.expiry_date
                ? d != null && d >= 0
                  ? d <= 60
                    ? `Vence em ${d}d`
                    : "OK"
                  : "Vencido"
                : "Sem prazo"
              return (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-hair-2 last:border-b-0 text-[12px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink">{c.type}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5 font-medium">
                      {c.parties ?? "—"}
                      {c.expiry_date && ` · ${fmtDateBR(c.expiry_date)}`}
                    </div>
                  </div>
                  <Badge variant={variant}>{label}</Badge>
                  <button onClick={() => setContractModal({ open: true, initial: c })} className="text-ink-3 hover:text-accent p-1 rounded">
                    <Icon name="edit" size={13} />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirmDelete(c.type)) return
                      await deleteContract(c.id); await reload()
                    }}
                    className="text-ink-3 hover:text-err p-1 rounded"
                  >
                    <Icon name="close" size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Alertas automáticos — informativo */}
      <div>
        <SectionHdr title="Alertas automáticos" />
        <div className="bg-card border border-hair rounded-lg p-4 text-[12px] text-ink-2 leading-relaxed font-medium">
          O scheduler do hub avisa via WhatsApp/Telegram quando:
          <ul className="mt-2 ml-4 list-disc text-[11.5px] space-y-0.5">
            <li>Prazo processual em até <strong>30, 15 e 7 dias</strong> (priorizado)</li>
            <li>Contrato com vencimento em <strong>60 dias</strong></li>
            <li>Briefing diário às 07:00 inclui resumo dos processos ativos</li>
          </ul>
          <div className="text-[10.5px] text-ink-3 mt-2">
            Configurações finas em <strong>/configuracoes</strong>.
          </div>
        </div>
      </div>

      <EditLegalCaseModal
        open={caseModal.open}
        onClose={() => setCaseModal({ open: false, initial: null })}
        initial={caseModal.initial}
        onSaved={reload}
      />
      <EditContractModal
        open={contractModal.open}
        onClose={() => setContractModal({ open: false, initial: null })}
        initial={contractModal.initial}
        onSaved={reload}
      />
    </>
  )
}
