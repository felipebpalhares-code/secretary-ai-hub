import type { Entity } from "./banks-data"

export type TributoKind =
  | "irpj"
  | "csll"
  | "pis"
  | "cofins"
  | "iss"
  | "icms"
  | "inss"
  | "fgts"
  | "irpf"
  | "iptu"
  | "ipva"
  | "das"

export type TributoStatus = "pendente" | "agendado" | "pago" | "atrasado"

export type Tributo = {
  id: string
  kind: TributoKind
  desc: string // descrição amigável
  meta?: string
  amount: number
  dueDate: string
  paidDate?: string
  entity: Entity
  status: TributoStatus
  competencia: string // ex: "Q1/2026", "Abr/2026"
  agentNote?: string
}

export type Certidao = {
  id: string
  name: string
  entity: Entity
  status: "regular" | "vencendo" | "vencida" | "pendente"
  expiry: string
  daysLeft?: number
}

export const TRIBUTOS_PROXIMOS: Tributo[] = [
  {
    id: "t1",
    kind: "irpj",
    desc: "DARF · IRPJ",
    meta: "PalharesTech · código 2089",
    amount: 12400,
    dueDate: "2026-04-30",
    entity: "palharestech",
    status: "agendado",
    competencia: "Q1/2026",
    agentNote: "Marcos: gerou DARF · agendado para 30/04",
  },
  {
    id: "t2",
    kind: "csll",
    desc: "DARF · CSLL",
    meta: "PalharesTech · código 2372",
    amount: 4480,
    dueDate: "2026-04-30",
    entity: "palharestech",
    status: "agendado",
    competencia: "Q1/2026",
  },
  {
    id: "t3",
    kind: "pis",
    desc: "DARF · PIS",
    meta: "PalharesTech · código 8109",
    amount: 920,
    dueDate: "2026-04-30",
    entity: "palharestech",
    status: "pendente",
    competencia: "Mar/2026",
  },
  {
    id: "t4",
    kind: "cofins",
    desc: "DARF · COFINS",
    meta: "PalharesTech · código 2172",
    amount: 4240,
    dueDate: "2026-04-30",
    entity: "palharestech",
    status: "pendente",
    competencia: "Mar/2026",
  },
  {
    id: "t5",
    kind: "iss",
    desc: "ISS · Curitiba",
    meta: "PalharesTech · prestação serviços",
    amount: 3800,
    dueDate: "2026-05-10",
    entity: "palharestech",
    status: "pendente",
    competencia: "Abr/2026",
  },
  {
    id: "t6",
    kind: "icms",
    desc: "ICMS · PR",
    meta: "Distribuidora Braz · GIA-ST",
    amount: 18420,
    dueDate: "2026-05-12",
    entity: "braz",
    status: "pendente",
    competencia: "Abr/2026",
    agentNote: "Marcos: aguardando apuração do contador José",
  },
  {
    id: "t7",
    kind: "inss",
    desc: "INSS · GPS",
    meta: "PalharesTech · folha 6 funcionários",
    amount: 8240,
    dueDate: "2026-05-20",
    entity: "palharestech",
    status: "pendente",
    competencia: "Abr/2026",
  },
  {
    id: "t8",
    kind: "fgts",
    desc: "FGTS · GFD",
    meta: "PalharesTech · 8% folha",
    amount: 3920,
    dueDate: "2026-05-07",
    entity: "palharestech",
    status: "pendente",
    competencia: "Abr/2026",
  },
  {
    id: "t9",
    kind: "iptu",
    desc: "IPTU · Casa Batel",
    meta: "Curitiba · venc. abril (3ª parcela)",
    amount: 1840,
    dueDate: "2026-04-30",
    entity: "pf",
    status: "pendente",
    competencia: "2026/3ª",
  },
  {
    id: "t10",
    kind: "ipva",
    desc: "IPVA · Audi A4",
    meta: "Final placa 2 · 4ª parcela",
    amount: 1280,
    dueDate: "2026-05-15",
    entity: "pf",
    status: "pendente",
    competencia: "2026/4ª",
  },
  {
    id: "t11",
    kind: "irpf",
    desc: "IRPF · Imposto a pagar",
    meta: "Carnê-leão Q2 · cota única",
    amount: 4280,
    dueDate: "2026-05-31",
    entity: "pf",
    status: "pendente",
    competencia: "Mar/2026",
    agentNote: "Marcos: 8ª e última cota disponível em maio",
  },
  {
    id: "t12",
    kind: "das",
    desc: "DAS · Simples Nacional",
    meta: "Distribuidora Braz · anexo I",
    amount: 6840,
    dueDate: "2026-05-20",
    entity: "braz",
    status: "pendente",
    competencia: "Abr/2026",
  },
]

export const TRIBUTOS_PAGOS: Tributo[] = [
  {
    id: "p1",
    kind: "irpj",
    desc: "DARF · IRPJ",
    meta: "PalharesTech · cota Q4/2025",
    amount: 11240,
    dueDate: "2026-04-19",
    paidDate: "2026-04-19",
    entity: "palharestech",
    status: "pago",
    competencia: "Q4/2025",
  },
  {
    id: "p2",
    kind: "iss",
    desc: "ISS · Curitiba",
    meta: "PalharesTech",
    amount: 3540,
    dueDate: "2026-04-10",
    paidDate: "2026-04-09",
    entity: "palharestech",
    status: "pago",
    competencia: "Mar/2026",
  },
  {
    id: "p3",
    kind: "fgts",
    desc: "FGTS · GFD",
    meta: "PalharesTech",
    amount: 3680,
    dueDate: "2026-04-07",
    paidDate: "2026-04-07",
    entity: "palharestech",
    status: "pago",
    competencia: "Mar/2026",
  },
  {
    id: "p4",
    kind: "inss",
    desc: "INSS · GPS",
    meta: "PalharesTech",
    amount: 7980,
    dueDate: "2026-04-20",
    paidDate: "2026-04-19",
    entity: "palharestech",
    status: "pago",
    competencia: "Mar/2026",
  },
]

export const CERTIDOES: Certidao[] = [
  {
    id: "c1",
    name: "Certidão Negativa Federal · CND",
    entity: "palharestech",
    status: "vencendo",
    expiry: "2026-05-05",
    daysLeft: 11,
  },
  {
    id: "c2",
    name: "Certidão Negativa Estadual · PR",
    entity: "palharestech",
    status: "regular",
    expiry: "2026-08-12",
    daysLeft: 110,
  },
  {
    id: "c3",
    name: "Certidão Municipal · Curitiba",
    entity: "palharestech",
    status: "regular",
    expiry: "2026-07-22",
    daysLeft: 89,
  },
  {
    id: "c4",
    name: "FGTS · CRF Empregador",
    entity: "palharestech",
    status: "regular",
    expiry: "2026-06-18",
    daysLeft: 55,
  },
  {
    id: "c5",
    name: "Certidão Trabalhista · CNDT",
    entity: "palharestech",
    status: "regular",
    expiry: "2026-09-30",
    daysLeft: 159,
  },
  {
    id: "c6",
    name: "Certidão Negativa Federal · Braz",
    entity: "braz",
    status: "regular",
    expiry: "2026-06-30",
    daysLeft: 67,
  },
]

export const KIND_LABEL: Record<TributoKind, string> = {
  irpj: "IRPJ",
  csll: "CSLL",
  pis: "PIS",
  cofins: "COFINS",
  iss: "ISS",
  icms: "ICMS",
  inss: "INSS",
  fgts: "FGTS",
  irpf: "IRPF",
  iptu: "IPTU",
  ipva: "IPVA",
  das: "DAS",
}

export const KIND_COLOR: Record<TributoKind, string> = {
  irpj: "bg-red-50 text-red-700 border-red-200",
  csll: "bg-red-50 text-red-700 border-red-200",
  pis: "bg-amber-50 text-amber-700 border-amber-200",
  cofins: "bg-amber-50 text-amber-700 border-amber-200",
  iss: "bg-blue-50 text-blue-700 border-blue-200",
  icms: "bg-purple-50 text-purple-700 border-purple-200",
  inss: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fgts: "bg-emerald-50 text-emerald-700 border-emerald-200",
  irpf: "bg-red-50 text-red-700 border-red-200",
  iptu: "bg-orange-50 text-orange-700 border-orange-200",
  ipva: "bg-orange-50 text-orange-700 border-orange-200",
  das: "bg-accent-soft text-accent border-indigo-200",
}

export function daysFromToday(iso: string): number {
  const today = new Date("2026-04-24")
  const due = new Date(iso)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
