import type { Bank, Entity } from "./banks-data"

export type CardBrand = "mastercard" | "visa" | "elo" | "amex"
export type CardTier = "Black" | "Gold" | "Platinum" | "Infinite" | "Business"

export type Charge = {
  id: string
  date: string // ISO
  desc: string
  meta?: string
  amount: number
  installment?: { current: number; total: number }
  category: string
}

export type CreditCard = {
  id: string
  bank: Bank
  bankLabel: string
  brand: CardBrand
  tier: CardTier
  last4: string
  holder: string
  limit: number
  used: number
  closeDay: number // dia do fechamento
  dueDay: number // dia do vencimento
  expiry: string // MM/YY
  entity: Entity
  primary?: boolean
  international?: boolean
  charges: Charge[]
}

export const CARDS: CreditCard[] = [
  {
    id: "itau-black",
    bank: "itau",
    bankLabel: "Itaú",
    brand: "mastercard",
    tier: "Black",
    last4: "4421",
    holder: "FELIPE B PALHARES",
    limit: 30000,
    used: 18420.5,
    closeDay: 3,
    dueDay: 10,
    expiry: "08/28",
    entity: "pf",
    primary: true,
    international: true,
    charges: [
      { id: "c1", date: "2026-04-21", desc: "Restaurante Mistura Oficial", amount: 284.6, category: "Lazer" },
      { id: "c2", date: "2026-04-20", desc: "Apple iCloud+ 2TB", amount: 49.9, category: "Assinatura" },
      { id: "c3", date: "2026-04-19", desc: "Uber · 4 corridas", amount: 124.4, category: "Transporte" },
      { id: "c4", date: "2026-04-18", desc: "Amazon · Livros", amount: 312.8, category: "Educação" },
      { id: "c5", date: "2026-04-17", desc: "Posto Shell", amount: 412.5, category: "Transporte" },
      { id: "c6", date: "2026-04-15", desc: "Drogaria Pacheco", amount: 187.4, category: "Saúde" },
      { id: "c7", date: "2026-04-14", desc: "Mercado Livre", meta: "Eletrônico · 6x", amount: 1840, installment: { current: 2, total: 6 }, category: "Compras" },
      { id: "c8", date: "2026-04-12", desc: "Spotify Family", amount: 34.9, category: "Assinatura" },
      { id: "c9", date: "2026-04-10", desc: "Netflix Premium", amount: 55.9, category: "Assinatura" },
      { id: "c10", date: "2026-04-08", desc: "Mercado Pão de Açúcar", amount: 487.34, category: "Alimentação" },
      { id: "c11", date: "2026-04-06", desc: "iFood", amount: 89.5, category: "Alimentação" },
      { id: "c12", date: "2026-04-05", desc: "Companhia Aérea LATAM", meta: "Voo CWB-GRU · 3x", amount: 4200, installment: { current: 1, total: 3 }, category: "Viagem" },
    ],
  },
  {
    id: "nubank",
    bank: "nubank",
    bankLabel: "Nubank",
    brand: "mastercard",
    tier: "Platinum",
    last4: "8856",
    holder: "FELIPE B PALHARES",
    limit: 15000,
    used: 4280.2,
    closeDay: 18,
    dueDay: 25,
    expiry: "11/27",
    entity: "pf",
    international: true,
    charges: [
      { id: "n1", date: "2026-04-22", desc: "Posto Shell", amount: 312.5, category: "Transporte" },
      { id: "n2", date: "2026-04-19", desc: "Mercado Pão de Açúcar", amount: 246.8, category: "Alimentação" },
      { id: "n3", date: "2026-04-15", desc: "Steam · Compras digitais", amount: 89.9, category: "Lazer" },
      { id: "n4", date: "2026-04-12", desc: "Cinema Cinemark · família", amount: 184.5, category: "Lazer" },
      { id: "n5", date: "2026-04-10", desc: "Amazon Prime", amount: 19.9, category: "Assinatura" },
    ],
  },
  {
    id: "bradesco-gold",
    bank: "bradesco",
    bankLabel: "Bradesco",
    brand: "visa",
    tier: "Gold",
    last4: "1102",
    holder: "FELIPE B PALHARES",
    limit: 8000,
    used: 6420,
    closeDay: 8,
    dueDay: 15,
    expiry: "04/25",
    entity: "pf",
    charges: [
      { id: "b1", date: "2026-04-18", desc: "Colégio Marista · mensalidade", amount: 3200, category: "Educação" },
      { id: "b2", date: "2026-04-18", desc: "Colégio Positivo · mensalidade", amount: 2850, category: "Educação" },
      { id: "b3", date: "2026-04-08", desc: "Plano de Saúde · Bradesco Top", amount: 370, category: "Saúde" },
    ],
  },
  {
    id: "itau-corp",
    bank: "itau",
    bankLabel: "Itaú PJ",
    brand: "mastercard",
    tier: "Business",
    last4: "9923",
    holder: "PALHARESTECH LTDA",
    limit: 50000,
    used: 12840,
    closeDay: 5,
    dueDay: 12,
    expiry: "06/27",
    entity: "palharestech",
    primary: true,
    international: true,
    charges: [
      { id: "p1", date: "2026-04-22", desc: "AWS · Cloud", amount: 4280, category: "Fornecedor" },
      { id: "p2", date: "2026-04-20", desc: "Salesforce · licenças", amount: 3420, category: "Fornecedor" },
      { id: "p3", date: "2026-04-18", desc: "Google Workspace", meta: "12 usuários", amount: 1820, category: "Fornecedor" },
      { id: "p4", date: "2026-04-15", desc: "Vercel Pro", amount: 1240, category: "Fornecedor" },
      { id: "p5", date: "2026-04-10", desc: "Eventos · Almoço cliente", amount: 880, category: "Vendas" },
      { id: "p6", date: "2026-04-05", desc: "Adobe Creative Cloud", amount: 1200, category: "Fornecedor" },
    ],
  },
]

export const BRAND_LABEL: Record<CardBrand, string> = {
  mastercard: "Mastercard",
  visa: "Visa",
  elo: "Elo",
  amex: "Amex",
}

export function fmtBRL2(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// Days until next due (mock — based on assumed today: 24/04/2026)
export function daysUntilDue(dueDay: number): number {
  const today = 24
  if (dueDay >= today) return dueDay - today
  // already passed this month, next due = month + 1
  const daysInMonth = 30
  return daysInMonth - today + dueDay
}
