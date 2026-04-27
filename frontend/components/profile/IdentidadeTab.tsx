"use client"
import type { ReactNode } from "react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { FieldRow } from "@/components/ui/FieldRow"
import { SensField } from "@/components/ui/SensField"
import { useIdentity } from "./identity-context"

/* ─── helpers locais ─── */
function SectionHdr({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-[10px]">
      <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">{title}</span>
      {action}
    </div>
  )
}

function Card({
  title,
  icon,
  extra,
  children,
}: {
  title: string
  icon: Parameters<typeof Icon>[0]["name"]
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-card border border-hair rounded-lg p-4 hover:border-ink-4 transition-colors">
      <div className="text-[12.5px] font-bold text-ink mb-3 flex items-center gap-[7px] tracking-[-.15px]">
        <Icon name={icon} size={14} className="text-ink-2" />
        <span>{title}</span>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {children}
    </div>
  )
}

function maskCpf(cpf: string | null) {
  if (!cpf) return "—"
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return cpf
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
}

function maskRg(rg: string | null) {
  if (!rg) return "—"
  return rg.replace(/[A-Za-z0-9]/g, (c, i) => (i >= rg.length - 1 ? c : "*"))
}

function maskGeneric(value: string | null) {
  if (!value) return "—"
  if (value.length <= 4) return "*".repeat(value.length)
  return value.slice(0, 2) + "*".repeat(Math.max(value.length - 4, 2)) + value.slice(-2)
}

function fmtDateBR(iso: string | null) {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function ageFrom(iso: string | null) {
  if (!iso) return null
  const birth = new Date(iso)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function IdentidadeTab() {
  const { identity, loading, error, openEdit } = useIdentity()

  if (loading) {
    return (
      <div className="text-center text-ink-3 text-[12.5px] py-10 font-medium">
        Carregando perfil…
      </div>
    )
  }

  if (error || !identity) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 text-[12.5px] font-semibold px-4 py-3 rounded">
        {error ?? "Perfil indisponível"}
      </div>
    )
  }

  const age = ageFrom(identity.birth_date)
  const cnhValid = identity.cnh_expiry && new Date(identity.cnh_expiry) > new Date()

  return (
    <div>
      <SectionHdr
        title="Dados pessoais"
        action={
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent border border-hair px-[11px] py-[5px] rounded-md hover:border-accent transition-colors"
          >
            <Icon name="edit" size={13} />
            Editar
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Card title="Informações gerais" icon="user">
          <FieldRow label="Nome completo">{identity.full_name ?? "—"}</FieldRow>
          <FieldRow label="Apelido">{identity.nickname ?? "—"}</FieldRow>
          <FieldRow label="Nascimento">
            {fmtDateBR(identity.birth_date)}
            {age !== null && (
              <>
                {" "}
                <Badge variant="neutral">{age} anos</Badge>
              </>
            )}
          </FieldRow>
          <FieldRow label="Estado civil">{identity.marital_status ?? "—"}</FieldRow>
          <FieldRow label="Religião">{identity.religion ?? "—"}</FieldRow>
          <FieldRow label="Naturalidade">{identity.birthplace ?? "—"}</FieldRow>
        </Card>
        <Card title="Documentos" icon="card">
          <FieldRow label="CPF">
            {identity.cpf ? (
              <SensField masked={maskCpf(identity.cpf)} real={identity.cpf} />
            ) : (
              "—"
            )}
          </FieldRow>
          <FieldRow label="RG">
            {identity.rg ? <SensField masked={maskRg(identity.rg)} real={identity.rg} /> : "—"}
          </FieldRow>
          <FieldRow label="CNH">
            {identity.cnh_number ? (
              <SensField
                masked={maskGeneric(identity.cnh_number)}
                real={identity.cnh_number}
                suffix={
                  identity.cnh_category || identity.cnh_expiry ? (
                    <Badge variant={cnhValid ? "green" : "amber"}>
                      {identity.cnh_category && `Cat. ${identity.cnh_category}`}
                      {identity.cnh_category && identity.cnh_expiry && " · "}
                      {identity.cnh_expiry && fmtDateBR(identity.cnh_expiry)}
                    </Badge>
                  ) : undefined
                }
              />
            ) : (
              "—"
            )}
          </FieldRow>
          <FieldRow label="Passaporte">
            {identity.passport_number ? (
              <SensField
                masked={maskGeneric(identity.passport_number)}
                real={identity.passport_number}
                suffix={
                  identity.passport_expiry ? (
                    <Badge variant="green">{fmtDateBR(identity.passport_expiry)}</Badge>
                  ) : undefined
                }
              />
            ) : (
              "—"
            )}
          </FieldRow>
        </Card>
      </div>
    </div>
  )
}
