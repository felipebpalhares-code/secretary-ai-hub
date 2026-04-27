"use client"
import type { ReactNode } from "react"
import { Icon } from "@/components/Icon"

/* ─── helpers de máscara / formato ─── */

export function onlyDigits(v: string | null | undefined) {
  return (v ?? "").replace(/\D/g, "")
}

export function maskCpf(cpf: string | null) {
  if (!cpf) return "—"
  const d = onlyDigits(cpf)
  if (d.length !== 11) return cpf
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}

export function maskCnpj(cnpj: string | null) {
  if (!cnpj) return "—"
  const d = onlyDigits(cnpj)
  if (d.length !== 14) return cnpj
  return `**.***.***/${d.slice(8, 12)}-**`
}

export function maskPhone(phone: string | null) {
  if (!phone) return "—"
  const d = onlyDigits(phone)
  if (d.length < 10) return phone
  const last4 = d.slice(-4)
  return `(${d.slice(0, 2)}) ****-${last4}`
}

export function maskGeneric(value: string | null) {
  if (!value) return "—"
  if (value.length <= 4) return "*".repeat(value.length)
  return value.slice(0, 2) + "*".repeat(Math.max(value.length - 4, 2)) + value.slice(-2)
}

export function fmtDateBR(iso: string | null) {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function fmtBRL(value: number | null) {
  if (value == null || isNaN(value)) return "—"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
}

export function ageFrom(iso: string | null) {
  if (!iso) return null
  const birth = new Date(iso)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function daysUntil(iso: string | null) {
  if (!iso) return null
  const target = new Date(iso)
  if (isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/* ─── apresentação ─── */

export function SectionHdr({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-[10px]">
      <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">{title}</span>
      {action}
    </div>
  )
}

export function Card({
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

export function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent border border-dashed border-ink-4 px-[11px] py-[5px] rounded-md hover:border-accent transition-colors"
    >
      <Icon name="plus" size={13} />
      {label}
    </button>
  )
}

export function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent border border-hair px-[11px] py-[5px] rounded-md hover:border-accent transition-colors"
    >
      <Icon name="edit" size={13} />
      Editar
    </button>
  )
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-err border border-red-200 bg-red-50 px-[11px] py-[5px] rounded-md hover:bg-red-100 transition-colors"
    >
      <Icon name="close" size={13} />
      Apagar
    </button>
  )
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="bg-card border border-dashed border-hair rounded-lg p-10 text-center flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-bg border border-hair flex items-center justify-center text-ink-3">
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div className="text-[13px] font-bold text-ink">{title}</div>
        {subtitle && <div className="text-[11.5px] text-ink-3 font-medium mt-1 max-w-md">{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

export function LoadingPlaceholder({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="text-center text-ink-3 text-[12.5px] py-10 font-medium">{label}</div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 text-[12.5px] font-semibold px-4 py-3 rounded">
      {message}
    </div>
  )
}

export function confirmDelete(label: string): boolean {
  if (typeof window === "undefined") return false
  return window.confirm(`Apagar "${label}"? Esta ação não pode ser desfeita.`)
}
