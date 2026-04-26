import type { Bank, Entity } from "./banks-data"

export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random"

export type PixFavorite = {
  id: string
  name: string
  initials: string
  tone: "indigo" | "ok" | "warn" | "amber" | "pink" | "purple" | "slate"
  keyType: PixKeyType
  keyMasked: string
  bankLabel: string
  lastSent?: { amount: number; date: string }
  totalSent: number
  category: "familia" | "fornecedor" | "funcionario" | "cliente" | "pessoal" | "agente"
}

export type PixTx = {
  id: string
  date: string // ISO datetime
  type: "in" | "out"
  counterpart: string
  bank: Bank
  bankLabel: string
  fromEntity: Entity
  amount: number
  message?: string
  status: "completed" | "scheduled" | "pending"
  scheduleDate?: string
}

export const PIX_FAVORITES: PixFavorite[] = [
  {
    id: "ana",
    name: "Ana Carolina Palhares",
    initials: "AC",
    tone: "pink",
    keyType: "phone",
    keyMasked: "(41) 9 ****-5432",
    bankLabel: "Itaú",
    lastSent: { amount: 5000, date: "2026-04-23" },
    totalSent: 38400,
    category: "familia",
  },
  {
    id: "roberto",
    name: "Roberto · Empreiteiro",
    initials: "RB",
    tone: "slate",
    keyType: "cpf",
    keyMasked: "***.***.***-32",
    bankLabel: "Bradesco",
    lastSent: { amount: 34200, date: "2026-04-22" },
    totalSent: 524600,
    category: "fornecedor",
  },
  {
    id: "siderurgica",
    name: "Siderúrgica SP Ltda",
    initials: "SP",
    tone: "warn",
    keyType: "cnpj",
    keyMasked: "**.***.***/0001-92",
    bankLabel: "Itaú PJ",
    lastSent: { amount: 24800, date: "2026-04-23" },
    totalSent: 312800,
    category: "fornecedor",
  },
  {
    id: "artcasa",
    name: "ArtCasa Esquadrias",
    initials: "AC",
    tone: "amber",
    keyType: "cnpj",
    keyMasked: "**.***.***/0001-44",
    bankLabel: "Bradesco PJ",
    lastSent: { amount: 32400, date: "2026-04-20" },
    totalSent: 184500,
    category: "fornecedor",
  },
  {
    id: "jose",
    name: "José Ferreira · Contador",
    initials: "JF",
    tone: "ok",
    keyType: "email",
    keyMasked: "j****@cont*****.com.br",
    bankLabel: "Itaú",
    lastSent: { amount: 3500, date: "2026-04-21" },
    totalSent: 28000,
    category: "fornecedor",
  },
  {
    id: "carlos-adv",
    name: "Dr. Carlos Lima · Advogado",
    initials: "CL",
    tone: "purple",
    keyType: "cpf",
    keyMasked: "***.***.***-12",
    bankLabel: "Santander",
    totalSent: 12500,
    category: "fornecedor",
  },
  {
    id: "mateus",
    name: "Mateus Palhares",
    initials: "MP",
    tone: "indigo",
    keyType: "phone",
    keyMasked: "(41) 9 ****-1212",
    bankLabel: "Nubank",
    lastSent: { amount: 200, date: "2026-04-15" },
    totalSent: 1800,
    category: "familia",
  },
  {
    id: "sofia",
    name: "Sofia Palhares",
    initials: "SP",
    tone: "pink",
    keyType: "phone",
    keyMasked: "(41) 9 ****-3434",
    bankLabel: "Nubank",
    totalSent: 600,
    category: "familia",
  },
]

export const PIX_HISTORY: PixTx[] = [
  {
    id: "p1",
    date: "2026-04-23T15:42:00",
    type: "in",
    counterpart: "Acme Corp · João Silva",
    bank: "itau",
    bankLabel: "Itaú PJ",
    fromEntity: "palharestech",
    amount: 15000,
    message: "Adiantamento proposta projeto XYZ",
    status: "completed",
  },
  {
    id: "p2",
    date: "2026-04-23T14:30:00",
    type: "out",
    counterpart: "Siderúrgica SP Ltda",
    bank: "itau",
    bankLabel: "Itaú PJ Vimar",
    fromEntity: "vimar",
    amount: 24800,
    message: "Aço CA-50 · NF 87234",
    status: "completed",
  },
  {
    id: "p3",
    date: "2026-04-22T11:15:00",
    type: "out",
    counterpart: "Roberto · Empreiteiro",
    bank: "bradesco",
    bankLabel: "Bradesco PJ Obras",
    fromEntity: "vimar",
    amount: 34200,
    message: "Folha quinzenal · 18 colaboradores",
    status: "completed",
  },
  {
    id: "p4",
    date: "2026-04-21T16:20:00",
    type: "out",
    counterpart: "José Ferreira · Contador",
    bank: "itau",
    bankLabel: "Itaú PJ",
    fromEntity: "palharestech",
    amount: 3500,
    message: "Honorários abril",
    status: "completed",
  },
  {
    id: "p5",
    date: "2026-04-20T09:48:00",
    type: "in",
    counterpart: "Cliente XYZ",
    bank: "itau",
    bankLabel: "Itaú PJ",
    fromEntity: "palharestech",
    amount: 38900,
    message: "Pagamento NF 0892",
    status: "completed",
  },
  {
    id: "p6",
    date: "2026-04-23T08:00:00",
    type: "out",
    counterpart: "Ana Carolina Palhares",
    bank: "itau",
    bankLabel: "Itaú",
    fromEntity: "pf",
    amount: 5000,
    message: "Mesada do mês",
    status: "completed",
  },
]

export const PIX_SCHEDULED: PixTx[] = [
  {
    id: "s1",
    date: "2026-04-25T08:00:00",
    type: "out",
    counterpart: "Hidráulica Sul",
    bank: "itau",
    bankLabel: "Itaú PJ Vimar",
    fromEntity: "vimar",
    amount: 18000,
    message: "Boleto materiais Bloco C",
    status: "scheduled",
    scheduleDate: "2026-04-25",
  },
  {
    id: "s2",
    date: "2026-04-30T08:00:00",
    type: "out",
    counterpart: "DARF · IRPJ",
    bank: "itau",
    bankLabel: "Itaú PJ",
    fromEntity: "palharestech",
    amount: 12400,
    message: "Q1/2026 · imposto",
    status: "scheduled",
    scheduleDate: "2026-04-30",
  },
  {
    id: "s3",
    date: "2026-04-30T14:00:00",
    type: "out",
    counterpart: "ArtCasa Esquadrias",
    bank: "itau",
    bankLabel: "Itaú PJ Vimar",
    fromEntity: "vimar",
    amount: 32400,
    message: "Boleto · venc. 30/04",
    status: "scheduled",
    scheduleDate: "2026-04-30",
  },
  {
    id: "s4",
    date: "2026-05-05T08:00:00",
    type: "out",
    counterpart: "Roberto · Empreiteiro",
    bank: "bradesco",
    bankLabel: "Bradesco PJ Obras",
    fromEntity: "vimar",
    amount: 34200,
    message: "Folha quinzenal · próxima",
    status: "scheduled",
    scheduleDate: "2026-05-05",
  },
]

export const PIX_KEYS = [
  { type: "cpf" as const, label: "CPF", value: "***.786.456-09", bank: "Itaú" },
  { type: "email" as const, label: "E-mail", value: "felipe@palharestech.com.br", bank: "Itaú PJ" },
  { type: "phone" as const, label: "Celular", value: "+55 41 9 9876-5432", bank: "Itaú" },
  { type: "random" as const, label: "Aleatória", value: "8a7c-4d2e-9b1f-0a5e", bank: "Nubank" },
]

export const KEY_LABEL: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  phone: "Celular",
  random: "Aleatória",
}
