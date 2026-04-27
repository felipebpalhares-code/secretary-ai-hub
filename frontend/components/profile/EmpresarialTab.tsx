"use client"
import { useCallback, useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { FieldRow } from "@/components/ui/FieldRow"
import { SensField } from "@/components/ui/SensField"
import {
  listCompanies,
  deleteCompany,
  listPartners,
  deletePartner,
  listProfessionals,
  deleteProfessional,
  type Company,
  type Partner,
  type Professional,
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
  maskCnpj,
  maskCpf,
  maskPhone,
} from "./_shared"
import { EditCompanyModal } from "./EditCompanyModal"
import { EditPartnerModal } from "./EditPartnerModal"
import { EditProfessionalModal } from "./EditProfessionalModal"
import { SearchCompaniesByCpfModal } from "./SearchCompaniesByCpfModal"

const ROLE_LABEL: Record<string, string> = {
  contador: "Contador",
  advogado: "Advogado",
  corretor: "Corretor",
  engenheiro: "Engenheiro",
  outro: "Outro",
}

function CompanyCard({
  company,
  partners,
  onEdit,
  onDelete,
  onAddPartner,
  onEditPartner,
  onDeletePartner,
}: {
  company: Company
  partners: Partner[]
  onEdit: () => void
  onDelete: () => void
  onAddPartner: () => void
  onEditPartner: (p: Partner) => void
  onDeletePartner: (p: Partner) => void
}) {
  return (
    <div className="bg-card border border-hair rounded-lg p-4 mb-3 hover:border-ink-4 transition-colors">
      <div className="text-[12.5px] font-bold text-ink mb-3 flex items-center gap-[7px] tracking-[-.15px]">
        <Icon name="building" size={14} className="text-ink-2" />
        <span>{company.name}</span>
        <Badge variant={company.is_active ? "green" : "gray"}>
          {company.is_active ? "Ativa" : "Inativa"}
        </Badge>
        <span className="ml-auto flex gap-2">
          <EditBtn onClick={onEdit} />
          <DeleteBtn onClick={onDelete} />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <FieldRow label="CNPJ">
            {company.cnpj ? <SensField masked={maskCnpj(company.cnpj)} real={company.cnpj} /> : "—"}
          </FieldRow>
          <FieldRow label="Ramo">{company.industry ?? "—"}</FieldRow>
          <FieldRow label="Cargo">{company.role ?? "—"}</FieldRow>
          <FieldRow label="Participação">
            {company.ownership_pct != null ? <Badge variant="indigo">{company.ownership_pct}%</Badge> : "—"}
          </FieldRow>
        </div>
        <div>
          <FieldRow label="Sistemas">
            {company.systems.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {company.systems.map((s, i) => (
                  <Badge key={`${s}-${i}`} variant="gray">{s}</Badge>
                ))}
              </div>
            ) : (
              "—"
            )}
          </FieldRow>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.06em]">
          Sócios ({partners.length})
        </div>
        <AddBtn label="Adicionar sócio" onClick={onAddPartner} />
      </div>

      {partners.length === 0 ? (
        <div className="text-[11.5px] text-ink-3 italic font-medium py-2">Nenhum sócio cadastrado.</div>
      ) : (
        <div className="border border-hair rounded-md overflow-hidden">
          {partners.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-3 py-2 border-b border-hair-2 last:border-b-0 text-[12px]"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink">{p.name}</div>
                <div className="text-[11px] text-ink-3 mt-0.5 font-medium flex gap-2 flex-wrap">
                  {p.cpf && <span className="mono">{maskCpf(p.cpf)}</span>}
                  {p.phone && <span className="mono">{maskPhone(p.phone)}</span>}
                  {p.email && <span>{p.email}</span>}
                </div>
              </div>
              {p.ownership != null && <Badge variant="indigo">{p.ownership}%</Badge>}
              <button
                onClick={() => onEditPartner(p)}
                className="text-ink-3 hover:text-accent p-1 rounded"
                aria-label="Editar sócio"
              >
                <Icon name="edit" size={13} />
              </button>
              <button
                onClick={() => onDeletePartner(p)}
                className="text-ink-3 hover:text-err p-1 rounded"
                aria-label="Apagar sócio"
              >
                <Icon name="close" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function EmpresarialTab() {
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [partnersByCompany, setPartnersByCompany] = useState<Record<number, Partner[]>>({})
  const [professionals, setProfessionals] = useState<Professional[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // modais
  const [companyModal, setCompanyModal] = useState<{ open: boolean; data: Company | null }>({
    open: false,
    data: null,
  })
  const [partnerModal, setPartnerModal] = useState<{
    open: boolean
    companyId: number | null
    data: Partner | null
  }>({ open: false, companyId: null, data: null })
  const [profModal, setProfModal] = useState<{ open: boolean; data: Professional | null }>({
    open: false,
    data: null,
  })
  const [searchByCpfOpen, setSearchByCpfOpen] = useState(false)

  const loadAll = useCallback(async () => {
    setError(null)
    try {
      const [comps, profs] = await Promise.all([listCompanies(), listProfessionals()])
      setCompanies(comps)
      setProfessionals(profs)
      const partnersMap: Record<number, Partner[]> = {}
      await Promise.all(
        comps.map(async (c) => {
          partnersMap[c.id] = await listPartners(c.id)
        }),
      )
      setPartnersByCompany(partnersMap)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar")
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  async function handleDeleteCompany(c: Company) {
    if (!confirmDelete(c.name)) return
    await deleteCompany(c.id)
    await loadAll()
  }

  async function handleDeletePartner(p: Partner) {
    if (!confirmDelete(p.name)) return
    await deletePartner(p.id)
    await loadAll()
  }

  async function handleDeleteProfessional(p: Professional) {
    if (!confirmDelete(p.name)) return
    await deleteProfessional(p.id)
    await loadAll()
  }

  if (companies === null || professionals === null) return <LoadingPlaceholder />
  if (error) return <ErrorBanner message={error} />

  return (
    <>
      <div>
        <SectionHdr
          title="Empresas"
          action={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSearchByCpfOpen(true)}
                title="Buscar empresas pelo CPF na Receita Federal"
                className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent border border-hair px-[11px] py-[5px] rounded-md hover:border-accent transition-colors"
              >
                <Icon name="search" size={13} />
                Buscar pelo CPF
              </button>
              <AddBtn label="Nova empresa" onClick={() => setCompanyModal({ open: true, data: null })} />
            </div>
          }
        />

        {companies.length === 0 ? (
          <EmptyState
            icon="building"
            title="Nenhuma empresa cadastrada"
            subtitle="Adicione a primeira empresa pra começar — sócios, sistemas e participação ficam dentro dela."
            action={<AddBtn label="Adicionar primeira empresa" onClick={() => setCompanyModal({ open: true, data: null })} />}
          />
        ) : (
          companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              partners={partnersByCompany[c.id] ?? []}
              onEdit={() => setCompanyModal({ open: true, data: c })}
              onDelete={() => handleDeleteCompany(c)}
              onAddPartner={() => setPartnerModal({ open: true, companyId: c.id, data: null })}
              onEditPartner={(p) => setPartnerModal({ open: true, companyId: c.id, data: p })}
              onDeletePartner={handleDeletePartner}
            />
          ))
        )}
      </div>

      <div>
        <SectionHdr
          title="Profissionais de confiança"
          action={<AddBtn label="Novo profissional" onClick={() => setProfModal({ open: true, data: null })} />}
        />

        {professionals.length === 0 ? (
          <EmptyState
            icon="users"
            title="Nenhum profissional cadastrado"
            subtitle="Contador, advogado, corretor ou engenheiro de obras — quem você consulta com frequência."
            action={<AddBtn label="Adicionar primeiro" onClick={() => setProfModal({ open: true, data: null })} />}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {professionals.map((p) => (
              <Card
                key={p.id}
                title={p.name}
                icon="user"
                extra={<Badge variant="gray">{ROLE_LABEL[p.role] ?? p.role}</Badge>}
              >
                <FieldRow label="Registro">{p.register ?? "—"}</FieldRow>
                <FieldRow label="Telefone">
                  {p.phone ? <SensField masked={maskPhone(p.phone)} real={p.phone} /> : "—"}
                </FieldRow>
                <FieldRow label="E-mail">{p.email ?? "—"}</FieldRow>
                {p.notes && <FieldRow label="Notas">{p.notes}</FieldRow>}
                <div className="flex gap-2 mt-3">
                  <EditBtn onClick={() => setProfModal({ open: true, data: p })} />
                  <DeleteBtn onClick={() => handleDeleteProfessional(p)} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditCompanyModal
        open={companyModal.open}
        onClose={() => setCompanyModal({ open: false, data: null })}
        initial={companyModal.data}
        onSaved={loadAll}
      />
      {partnerModal.companyId !== null && (
        <EditPartnerModal
          open={partnerModal.open}
          onClose={() => setPartnerModal({ open: false, companyId: null, data: null })}
          companyId={partnerModal.companyId}
          initial={partnerModal.data}
          onSaved={loadAll}
        />
      )}
      <EditProfessionalModal
        open={profModal.open}
        onClose={() => setProfModal({ open: false, data: null })}
        initial={profModal.data}
        onSaved={loadAll}
      />
      <SearchCompaniesByCpfModal
        open={searchByCpfOpen}
        onClose={() => setSearchByCpfOpen(false)}
        existingCompanies={companies ?? []}
        onSaved={loadAll}
      />
    </>
  )
}
