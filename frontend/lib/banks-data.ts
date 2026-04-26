export type Entity = "pf" | "palharestech" | "braz" | "vimar"

export type Bank = "itau" | "nubank" | "bradesco" | "bb" | "santander" | "inter"

export type BankAccount = {
  id: string
  bank: Bank
  bankLabel: string
  agency?: string
  account: string
  type: "corrente" | "poupanca" | "investimento" | "digital"
  entity: Entity
  balance: number
  variation: number // % do mês
  lastSync: string
  syncStatus: "ok" | "syncing" | "error"
  primary?: boolean
}

export type EntityInfo = {
  id: Entity
  label: string
  short: string
  icon: string
  initial: string
  tone: "indigo" | "ok" | "warn" | "amber"
}

export const ENTITIES: EntityInfo[] = [
  { id: "pf", label: "Felipe Palhares · PF", short: "Felipe PF", icon: "user", initial: "F", tone: "indigo" },
  { id: "palharestech", label: "PalharesTech Ltda.", short: "PalharesTech", icon: "building", initial: "P", tone: "ok" },
  { id: "braz", label: "Distribuidora Braz Ltda.", short: "Braz", icon: "building", initial: "B", tone: "warn" },
  { id: "vimar", label: "Vimar Empreendimentos", short: "Vimar", icon: "home", initial: "V", tone: "amber" },
]

export const ACCOUNTS: BankAccount[] = [
  // Felipe PF
  {
    id: "itau-pf-cc",
    bank: "itau",
    bankLabel: "Itaú",
    agency: "0001",
    account: "12345-6",
    type: "corrente",
    entity: "pf",
    balance: 47810,
    variation: 2.4,
    lastSync: "há 2 min",
    syncStatus: "ok",
    primary: true,
  },
  {
    id: "nubank-pf",
    bank: "nubank",
    bankLabel: "Nubank",
    account: "78901-2",
    type: "digital",
    entity: "pf",
    balance: 23420,
    variation: -1.2,
    lastSync: "há 1 min",
    syncStatus: "ok",
  },
  {
    id: "bradesco-pf-cp",
    bank: "bradesco",
    bankLabel: "Bradesco",
    agency: "0567",
    account: "34567-8",
    type: "poupanca",
    entity: "pf",
    balance: 156200,
    variation: 0.8,
    lastSync: "há 3 min",
    syncStatus: "ok",
  },
  // PalharesTech
  {
    id: "itau-pt-cc",
    bank: "itau",
    bankLabel: "Itaú PJ",
    agency: "1234",
    account: "98765-4",
    type: "corrente",
    entity: "palharestech",
    balance: 312500,
    variation: 4.2,
    lastSync: "há 2 min",
    syncStatus: "ok",
    primary: true,
  },
  {
    id: "santander-pt",
    bank: "santander",
    bankLabel: "Santander PJ",
    agency: "0892",
    account: "11223-3",
    type: "investimento",
    entity: "palharestech",
    balance: 180000,
    variation: 1.1,
    lastSync: "há 5 min",
    syncStatus: "ok",
  },
  // Braz
  {
    id: "bb-braz-cc",
    bank: "bb",
    bankLabel: "Banco do Brasil PJ",
    agency: "3214",
    account: "55512-0",
    type: "corrente",
    entity: "braz",
    balance: 89200,
    variation: -3.1,
    lastSync: "há 12h",
    syncStatus: "syncing",
    primary: true,
  },
  {
    id: "inter-braz",
    bank: "inter",
    bankLabel: "Inter PJ",
    account: "00789-2",
    type: "digital",
    entity: "braz",
    balance: 28400,
    variation: 0.4,
    lastSync: "há 4 min",
    syncStatus: "ok",
  },
  // Vimar
  {
    id: "itau-vimar",
    bank: "itau",
    bankLabel: "Itaú PJ Vimar",
    agency: "0001",
    account: "45678-9",
    type: "corrente",
    entity: "vimar",
    balance: 487320,
    variation: 8.1,
    lastSync: "há 2 min",
    syncStatus: "ok",
    primary: true,
  },
  {
    id: "bradesco-vimar",
    bank: "bradesco",
    bankLabel: "Bradesco PJ Obras",
    agency: "0567",
    account: "12345-0",
    type: "corrente",
    entity: "vimar",
    balance: 182100,
    variation: 2.3,
    lastSync: "há 4 min",
    syncStatus: "ok",
  },
  {
    id: "bb-vimar-cp",
    bank: "bb",
    bankLabel: "BB PJ Poupança",
    agency: "3214",
    account: "98765-2",
    type: "poupanca",
    entity: "vimar",
    balance: 64500,
    variation: 0.6,
    lastSync: "há 12h",
    syncStatus: "syncing",
  },
]

// Soma de saldos de uma entidade
export function entityTotal(entity: Entity): number {
  return ACCOUNTS.filter((a) => a.entity === entity).reduce((s, a) => s + a.balance, 0)
}

// Total geral
export const TOTAL_BALANCE = ACCOUNTS.reduce((s, a) => s + a.balance, 0)

// Mock de movimento do mês (entrada / saída)
export const MONTH_FLOW = {
  entrada: 487000,
  saida: 358450,
  saldo: 128550,
  projecao: 1820000, // próximos 30 dias
}

export const BANK_COLORS: Record<Bank, string> = {
  itau: "bg-orange-500",
  nubank: "bg-purple-600",
  bradesco: "bg-red-600",
  bb: "bg-yellow-500",
  santander: "bg-red-500",
  inter: "bg-orange-600",
}

export function fmtBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function fmtCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`
  return fmtBRL(value)
}
