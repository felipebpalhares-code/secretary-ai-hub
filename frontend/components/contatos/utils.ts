import type { Contact, Category } from "@/lib/contacts-types"

/** Nome da empresa do contato — prefere a Organization vinculada e cai no shadow. */
export function contactCompany(c: Pick<Contact, "organization" | "company_name">): string | null {
  return c.organization?.name ?? c.company_name ?? null
}

/** Iniciais a partir do nome (até 2 letras). Fallback E-/T- pra contato só com email/telefone. */
export function initialsOf(c: Pick<Contact, "name" | "email" | "phone">): string {
  if (c.name) {
    const parts = c.name.trim().split(/\s+/).slice(0, 2)
    return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?"
  }
  if (c.email) return c.email[0]?.toUpperCase() ?? "?"
  if (c.phone) return "📞"
  return "?"
}

/** Etiqueta display: nome > email > telefone. */
export function displayLabel(c: Pick<Contact, "name" | "email" | "phone">): string {
  return c.name || c.email || c.phone || "Sem identificação"
}

/** Cor estável a partir de string (paleta tailwind slate/zinc/indigo/emerald). */
const TONE_PALETTE = [
  "bg-slate-700", "bg-slate-600", "bg-slate-500",
  "bg-indigo-600", "bg-emerald-600", "bg-zinc-700", "bg-zinc-600",
] as const

export function avatarTone(seed: string | number): string {
  const s = String(seed)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return TONE_PALETTE[h % TONE_PALETTE.length]
}

export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return ""
  const d = raw.replace(/\D/g, "")
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return raw
}

export function categoryById(cats: Category[], id: number | null): Category | null {
  if (id == null) return null
  return cats.find((c) => c.id === id) ?? null
}
