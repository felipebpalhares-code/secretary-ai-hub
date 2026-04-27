"use client"
import { useCallback, useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { FieldRow } from "@/components/ui/FieldRow"
import { SensField } from "@/components/ui/SensField"
import {
  listFamily,
  deleteFamilyMember,
  listFamilyDoctors,
  deleteFamilyDoctor,
  type FamilyMember,
  type FamilyRelation,
  type FamilyDoctor,
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
  ageFrom,
  confirmDelete,
  fmtDateBR,
  maskCpf,
  maskPhone,
} from "./_shared"
import { EditFamilyMemberModal } from "./EditFamilyMemberModal"
import { EditFamilyDoctorModal } from "./EditFamilyDoctorModal"

const RELATION_BADGE: Record<string, { label: string; variant: "gray" | "indigo" }> = {
  pai: { label: "Pai", variant: "gray" },
  mae: { label: "Mãe", variant: "gray" },
  irmao: { label: "Irmão(ã)", variant: "gray" },
  conjuge: { label: "Cônjuge", variant: "indigo" },
}

function MemberCard({
  m,
  onEdit,
  onDelete,
}: {
  m: FamilyMember
  onEdit: () => void
  onDelete: () => void
}) {
  const age = ageFrom(m.birth_date)
  return (
    <Card
      title={m.name}
      icon="user"
      extra={age !== null ? <Badge variant="neutral">{age} anos</Badge> : undefined}
    >
      {m.birth_date && <FieldRow label="Nascimento">{fmtDateBR(m.birth_date)}</FieldRow>}
      {m.cpf && (
        <FieldRow label="CPF">
          <SensField masked={maskCpf(m.cpf)} real={m.cpf} />
        </FieldRow>
      )}
      {m.phone && (
        <FieldRow label="Telefone">
          <SensField masked={maskPhone(m.phone)} real={m.phone} />
        </FieldRow>
      )}
      {m.email && <FieldRow label="E-mail">{m.email}</FieldRow>}
      {m.school && <FieldRow label="Escola">{m.school}</FieldRow>}
      {m.doctor_name && <FieldRow label="Médico">{m.doctor_name}</FieldRow>}
      {m.notes && <FieldRow label="Notas">{m.notes}</FieldRow>}
      <div className="flex gap-2 mt-3">
        <EditBtn onClick={onEdit} />
        <DeleteBtn onClick={onDelete} />
      </div>
    </Card>
  )
}

export function FamiliaTab() {
  const [members, setMembers] = useState<FamilyMember[] | null>(null)
  const [doctors, setDoctors] = useState<FamilyDoctor[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [memberModal, setMemberModal] = useState<{
    open: boolean
    initial: FamilyMember | null
    defaultRelation: FamilyRelation
    lock: boolean
  }>({ open: false, initial: null, defaultRelation: "filho", lock: false })

  const [doctorModal, setDoctorModal] = useState<{ open: boolean; initial: FamilyDoctor | null }>({
    open: false,
    initial: null,
  })

  const reload = useCallback(async () => {
    setError(null)
    try {
      const [m, d] = await Promise.all([listFamily(), listFamilyDoctors()])
      setMembers(m)
      setDoctors(d)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar família")
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleDelete(m: FamilyMember) {
    if (!confirmDelete(m.name)) return
    await deleteFamilyMember(m.id)
    await reload()
  }

  async function handleDeleteDoctor(d: FamilyDoctor) {
    if (!confirmDelete(d.name)) return
    await deleteFamilyDoctor(d.id)
    await reload()
  }

  if (members === null || doctors === null) return <LoadingPlaceholder />
  if (error) return <ErrorBanner message={error} />

  const spouse = members.find((m) => m.relation === "conjuge") ?? null
  const children = members.filter((m) => m.relation === "filho")
  const parentsAndSiblings = members.filter((m) => ["pai", "mae", "irmao"].includes(m.relation))

  return (
    <>
      {/* Cônjuge */}
      <div>
        <SectionHdr
          title="Cônjuge"
          action={
            spouse ? (
              <EditBtn onClick={() => setMemberModal({ open: true, initial: spouse, defaultRelation: "conjuge", lock: true })} />
            ) : (
              <AddBtn label="Adicionar cônjuge" onClick={() => setMemberModal({ open: true, initial: null, defaultRelation: "conjuge", lock: true })} />
            )
          }
        />
        {spouse ? (
          <MemberCard
            m={spouse}
            onEdit={() => setMemberModal({ open: true, initial: spouse, defaultRelation: "conjuge", lock: true })}
            onDelete={() => handleDelete(spouse)}
          />
        ) : (
          <EmptyState
            icon="user"
            title="Nenhum cônjuge cadastrado"
            subtitle="Adicione cônjuge ou parceiro(a) — é referência usada pela Ana (agente) pra sugestões e lembretes."
          />
        )}
      </div>

      {/* Filhos */}
      <div>
        <SectionHdr
          title="Filhos"
          action={
            <AddBtn
              label="Adicionar filho(a)"
              onClick={() => setMemberModal({ open: true, initial: null, defaultRelation: "filho", lock: true })}
            />
          }
        />
        {children.length === 0 ? (
          <EmptyState icon="users" title="Nenhum filho cadastrado" subtitle="Inclua para ter dados de escola, médico e aniversários no contexto dos agentes." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {children.map((c) => (
              <MemberCard
                key={c.id}
                m={c}
                onEdit={() => setMemberModal({ open: true, initial: c, defaultRelation: "filho", lock: true })}
                onDelete={() => handleDelete(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pais e irmãos */}
      <div>
        <SectionHdr
          title="Pais e irmãos"
          action={
            <AddBtn
              label="Adicionar"
              onClick={() => setMemberModal({ open: true, initial: null, defaultRelation: "irmao", lock: false })}
            />
          }
        />
        {parentsAndSiblings.length === 0 ? (
          <EmptyState icon="users" title="Nenhum cadastrado" subtitle="Pai, mãe, irmãos — pra lembretes de aniversário e contato em emergências." />
        ) : (
          <div className="border border-hair rounded-md overflow-hidden bg-card">
            {parentsAndSiblings.map((p) => {
              const badge = RELATION_BADGE[p.relation] ?? { label: p.relation, variant: "gray" as const }
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-hair-2 last:border-b-0 text-[12.5px]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink flex items-center gap-2">
                      {p.name} <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <div className="text-[11px] text-ink-3 mt-0.5 font-medium flex gap-3 flex-wrap">
                      {p.birth_date && <span>{fmtDateBR(p.birth_date)}</span>}
                      {p.phone && <span className="mono">{maskPhone(p.phone)}</span>}
                      {p.email && <span>{p.email}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setMemberModal({ open: true, initial: p, defaultRelation: p.relation as FamilyRelation, lock: false })}
                    className="text-ink-3 hover:text-accent p-1 rounded"
                  >
                    <Icon name="edit" size={13} />
                  </button>
                  <button onClick={() => handleDelete(p)} className="text-ink-3 hover:text-err p-1 rounded">
                    <Icon name="close" size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Médicos da família */}
      <div>
        <SectionHdr
          title="Médicos da família"
          action={<AddBtn label="Novo médico" onClick={() => setDoctorModal({ open: true, initial: null })} />}
        />
        {doctors.length === 0 ? (
          <EmptyState icon="phone" title="Nenhum médico cadastrado" subtitle="Pediatra, cardiologista, médico de família — quem você procura primeiro." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {doctors.map((d) => (
              <Card
                key={d.id}
                title={d.name}
                icon="user"
                extra={d.specialty ? <Badge variant="gray">{d.specialty}</Badge> : undefined}
              >
                {d.serves && <FieldRow label="Atende">{d.serves}</FieldRow>}
                {d.phone && (
                  <FieldRow label="Telefone">
                    <SensField masked={maskPhone(d.phone)} real={d.phone} />
                  </FieldRow>
                )}
                {d.clinic && <FieldRow label="Clínica">{d.clinic}</FieldRow>}
                <div className="flex gap-2 mt-3">
                  <EditBtn onClick={() => setDoctorModal({ open: true, initial: d })} />
                  <DeleteBtn onClick={() => handleDeleteDoctor(d)} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditFamilyMemberModal
        open={memberModal.open}
        onClose={() => setMemberModal({ open: false, initial: null, defaultRelation: "filho", lock: false })}
        initial={memberModal.initial}
        defaultRelation={memberModal.defaultRelation}
        lockRelation={memberModal.lock}
        onSaved={reload}
      />
      <EditFamilyDoctorModal
        open={doctorModal.open}
        onClose={() => setDoctorModal({ open: false, initial: null })}
        initial={doctorModal.initial}
        onSaved={reload}
      />
    </>
  )
}
