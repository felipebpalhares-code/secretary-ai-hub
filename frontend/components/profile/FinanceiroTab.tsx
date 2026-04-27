"use client"
import { useCallback, useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { FieldRow } from "@/components/ui/FieldRow"
import {
  listInvestments,
  deleteInvestment,
  listRealEstate,
  deleteRealEstate,
  type Investment,
  type RealEstate,
} from "@/lib/api"
import {
  AddBtn,
  Card,
  DeleteBtn,
  EditBtn,
  EmptyState,
  ErrorBanner,
  LoadingPlaceholder,
  SectionHdr,
  confirmDelete,
  fmtBRL,
} from "./_shared"
import { EditInvestmentModal } from "./EditInvestmentModal"
import { EditRealEstateModal } from "./EditRealEstateModal"

export function FinanceiroTab() {
  const [investments, setInvestments] = useState<Investment[] | null>(null)
  const [realEstate, setRealEstate] = useState<RealEstate[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [invModal, setInvModal] = useState<{ open: boolean; initial: Investment | null }>({
    open: false, initial: null,
  })
  const [reModal, setReModal] = useState<{ open: boolean; initial: RealEstate | null }>({
    open: false, initial: null,
  })

  const reload = useCallback(async () => {
    setError(null)
    try {
      const [inv, re] = await Promise.all([listInvestments(), listRealEstate()])
      setInvestments(inv)
      setRealEstate(re)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar finanças")
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleDeleteInvestment(i: Investment) {
    if (!confirmDelete(`${i.type} · ${i.institution ?? "—"}`)) return
    await deleteInvestment(i.id)
    await reload()
  }

  async function handleDeleteRealEstate(re: RealEstate) {
    if (!confirmDelete(re.label)) return
    await deleteRealEstate(re.id)
    await reload()
  }

  if (investments === null || realEstate === null) return <LoadingPlaceholder />
  if (error) return <ErrorBanner message={error} />

  const investTotal = investments.reduce((s, i) => s + (i.approx_value ?? 0), 0)
  const reTotal = realEstate.reduce((s, r) => s + (r.approx_value ?? 0), 0)

  return (
    <>
      <div className="bg-card border border-hair rounded-md p-3 text-[11.5px] text-ink-2 font-medium">
        <Icon name="bank" size={13} className="inline mr-1.5 text-ink-3" />
        Contas bancárias e cartões ficam em <strong className="text-ink">/bancos</strong> (com sincronização automática via Pluggy). Aqui mantemos só patrimônio: investimentos e imóveis.
      </div>

      <div>
        <SectionHdr
          title={`Investimentos${investments.length ? ` · ${fmtBRL(investTotal)} aprox.` : ""}`}
          action={<AddBtn label="Novo investimento" onClick={() => setInvModal({ open: true, initial: null })} />}
        />
        {investments.length === 0 ? (
          <EmptyState
            icon="chart"
            title="Nenhum investimento cadastrado"
            subtitle="Tesouro, CDB, FII, ações — registre pra ter visão consolidada de patrimônio."
            action={<AddBtn label="Adicionar primeiro" onClick={() => setInvModal({ open: true, initial: null })} />}
          />
        ) : (
          <div className="border border-hair rounded-md overflow-hidden bg-card">
            {investments.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-hair-2 last:border-b-0 text-[12.5px]"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink">{i.type}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5 font-medium flex gap-2 flex-wrap">
                    {i.institution && <span>{i.institution}</span>}
                    {i.rate_description && <Badge variant="green">{i.rate_description}</Badge>}
                  </div>
                </div>
                <div className="font-bold tabular text-ink">{fmtBRL(i.approx_value)}</div>
                <button
                  onClick={() => setInvModal({ open: true, initial: i })}
                  className="text-ink-3 hover:text-accent p-1 rounded"
                >
                  <Icon name="edit" size={13} />
                </button>
                <button onClick={() => handleDeleteInvestment(i)} className="text-ink-3 hover:text-err p-1 rounded">
                  <Icon name="close" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHdr
          title={`Imóveis${realEstate.length ? ` · ${fmtBRL(reTotal)} aprox.` : ""}`}
          action={<AddBtn label="Novo imóvel" onClick={() => setReModal({ open: true, initial: null })} />}
        />
        {realEstate.length === 0 ? (
          <EmptyState
            icon="home"
            title="Nenhum imóvel cadastrado"
            subtitle="Residência, comercial, terreno — guarda matrícula e financiamento."
            action={<AddBtn label="Adicionar primeiro" onClick={() => setReModal({ open: true, initial: null })} />}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {realEstate.map((r) => (
              <Card
                key={r.id}
                title={r.label}
                icon={r.is_financed ? "building" : "home"}
                extra={
                  <Badge variant={r.is_financed ? "amber" : "green"}>
                    {r.is_financed ? "Financiado" : "Quitado"}
                  </Badge>
                }
              >
                {r.address && <FieldRow label="Endereço">{r.address}</FieldRow>}
                {r.registration && <FieldRow label="Matrícula">{r.registration}</FieldRow>}
                <FieldRow label="Valor"><span className="font-bold tabular">{fmtBRL(r.approx_value)}</span></FieldRow>
                {r.is_financed && r.financed_until && (
                  <FieldRow label="Financiado até">{r.financed_until}</FieldRow>
                )}
                <div className="flex gap-2 mt-3">
                  <EditBtn onClick={() => setReModal({ open: true, initial: r })} />
                  <DeleteBtn onClick={() => handleDeleteRealEstate(r)} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditInvestmentModal
        open={invModal.open}
        onClose={() => setInvModal({ open: false, initial: null })}
        initial={invModal.initial}
        onSaved={reload}
      />
      <EditRealEstateModal
        open={reModal.open}
        onClose={() => setReModal({ open: false, initial: null })}
        initial={reModal.initial}
        onSaved={reload}
      />
    </>
  )
}
