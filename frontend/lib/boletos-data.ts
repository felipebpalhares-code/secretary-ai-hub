import type { Entity } from "./banks-data"

export type BoletoOrigin = "whatsapp" | "telegram" | "email" | "upload" | "manual" | "auto"
export type BoletoStatus = "pendente" | "agendado" | "pago" | "atrasado" | "recebido" | "aguardando"

export type Boleto = {
  id: string
  payee: string // beneficiário
  payeeBank?: string
  desc: string
  meta?: string
  amount: number
  dueDate: string // ISO
  paidDate?: string
  entity: Entity // qual entidade paga (ou recebe)
  origin: BoletoOrigin
  status: BoletoStatus
  ocrConfidence?: number // 0-100
  attachments: number
  category: string
  digitableLine?: string
  agentSuggestion?: string
}

const today = "2026-04-24"

export const BOLETOS_PAGAR: Boleto[] = [
  {
    id: "b1",
    payee: "Nubank S.A.",
    payeeBank: "Nubank",
    desc: "Fatura cartão · abril",
    meta: "Cartão Platinum ●●●● 8856",
    amount: 4280.2,
    dueDate: "2026-04-25",
    entity: "pf",
    origin: "whatsapp",
    status: "pendente",
    ocrConfidence: 99,
    attachments: 1,
    category: "Cartão",
    digitableLine: "34191.79001 01043.510001 23456.789012 1 95730000428020",
    agentSuggestion: "Ricardo: pagar agora · Itaú PF tem saldo",
  },
  {
    id: "b2",
    payee: "Companhia Paranaense de Energia",
    payeeBank: "Banco do Brasil",
    desc: "Conta de luz · Casa Batel",
    meta: "Consumo abril · 542 kWh",
    amount: 487.4,
    dueDate: "2026-04-25",
    entity: "pf",
    origin: "email",
    status: "pendente",
    attachments: 1,
    category: "Moradia",
  },
  {
    id: "b3",
    payee: "Hidráulica Sul Ltda.",
    desc: "Materiais · NF 1234",
    meta: "Bloco C · Vimar",
    amount: 18000,
    dueDate: "2026-04-25",
    entity: "vimar",
    origin: "whatsapp",
    status: "agendado",
    ocrConfidence: 96,
    attachments: 2,
    category: "Material obra",
    agentSuggestion: "Engenheiro: aprovado · pagamento 25/04",
  },
  {
    id: "b4",
    payee: "Imobiliária ABC",
    desc: "Aluguel comercial · maio",
    meta: "Sala R. XV · PalharesTech",
    amount: 8500,
    dueDate: "2026-04-30",
    entity: "palharestech",
    origin: "manual",
    status: "agendado",
    attachments: 1,
    category: "Moradia",
  },
  {
    id: "b5",
    payee: "Receita Federal",
    desc: "DARF · IRPJ Q1/2026",
    meta: "PalharesTech · código 2089",
    amount: 12400,
    dueDate: "2026-04-30",
    entity: "palharestech",
    origin: "auto",
    status: "agendado",
    attachments: 1,
    category: "Imposto",
    agentSuggestion: "Marcos: gerou DARF automaticamente · agendado",
  },
  {
    id: "b6",
    payee: "ArtCasa Esquadrias",
    desc: "Esquadrias alumínio · NF 4421",
    meta: "Bloco A · Vimar",
    amount: 32400,
    dueDate: "2026-04-30",
    entity: "vimar",
    origin: "whatsapp",
    status: "agendado",
    ocrConfidence: 98,
    attachments: 2,
    category: "Material obra",
  },
  {
    id: "b7",
    payee: "Sanepar",
    desc: "Conta de água · Casa Batel",
    meta: "Consumo abril",
    amount: 142.8,
    dueDate: "2026-05-05",
    entity: "pf",
    origin: "email",
    status: "pendente",
    attachments: 1,
    category: "Moradia",
  },
  {
    id: "b8",
    payee: "Vivo Empresas",
    desc: "Telefonia + internet",
    meta: "PalharesTech · plano corporativo",
    amount: 1840,
    dueDate: "2026-05-08",
    entity: "palharestech",
    origin: "auto",
    status: "pendente",
    attachments: 1,
    category: "Fornecedor",
  },
  {
    id: "b9",
    payee: "Bandeirantes Energia",
    desc: "Conta de luz · Sala comercial",
    meta: "PalharesTech · 320 kWh",
    amount: 412.1,
    dueDate: "2026-05-10",
    entity: "palharestech",
    origin: "email",
    status: "pendente",
    attachments: 1,
    category: "Moradia",
  },
]

export const BOLETOS_PAGOS: Boleto[] = [
  {
    id: "p1",
    payee: "Itaú Unibanco",
    payeeBank: "Itaú",
    desc: "Fatura cartão Black · março",
    amount: 21450.8,
    dueDate: "2026-04-10",
    paidDate: "2026-04-09",
    entity: "pf",
    origin: "auto",
    status: "pago",
    attachments: 2,
    category: "Cartão",
  },
  {
    id: "p2",
    payee: "Empreiteiro · Roberto",
    desc: "Folha quinzenal · 18 colaboradores",
    amount: 34200,
    dueDate: "2026-04-20",
    paidDate: "2026-04-22",
    entity: "vimar",
    origin: "whatsapp",
    status: "pago",
    attachments: 1,
    category: "Mão de obra",
  },
  {
    id: "p3",
    payee: "Colégio Marista Rosário",
    desc: "Mensalidade abril · Mateus",
    amount: 3200,
    dueDate: "2026-04-18",
    paidDate: "2026-04-18",
    entity: "pf",
    origin: "email",
    status: "pago",
    attachments: 1,
    category: "Educação",
  },
  {
    id: "p4",
    payee: "Colégio Positivo Junior",
    desc: "Mensalidade abril · Sofia",
    amount: 2850,
    dueDate: "2026-04-18",
    paidDate: "2026-04-18",
    entity: "pf",
    origin: "email",
    status: "pago",
    attachments: 1,
    category: "Educação",
  },
  {
    id: "p5",
    payee: "Siderúrgica SP",
    desc: "Aço CA-50 · NF 87234",
    amount: 24800,
    dueDate: "2026-04-23",
    paidDate: "2026-04-23",
    entity: "vimar",
    origin: "whatsapp",
    status: "pago",
    attachments: 2,
    category: "Material obra",
  },
]

export const BOLETOS_RECEBER: Boleto[] = [
  {
    id: "r1",
    payee: "Acme Corp",
    desc: "Proposta projeto XYZ · 50% inicial",
    meta: "NF emitida · prazo 18h hoje",
    amount: 44500,
    dueDate: "2026-04-24",
    entity: "palharestech",
    origin: "manual",
    status: "aguardando",
    attachments: 1,
    category: "Receita",
    agentSuggestion: "Diretor: cliente confirmou pagamento até 18h",
  },
  {
    id: "r2",
    payee: "Cliente XYZ",
    desc: "NF 0892 · serviço mensal",
    amount: 38900,
    dueDate: "2026-04-30",
    entity: "palharestech",
    origin: "manual",
    status: "aguardando",
    attachments: 1,
    category: "Receita",
  },
  {
    id: "r3",
    payee: "Distribuidora ABC",
    desc: "Pedido #4521 · 30 dias",
    amount: 45200,
    dueDate: "2026-05-15",
    entity: "braz",
    origin: "manual",
    status: "aguardando",
    attachments: 1,
    category: "Receita",
  },
  {
    id: "r4",
    payee: "Comprador Unidade 401",
    desc: "Restante do imóvel · financ. liberado",
    amount: 720000,
    dueDate: "2026-05-22",
    entity: "vimar",
    origin: "manual",
    status: "aguardando",
    attachments: 3,
    category: "Receita",
  },
]

export const ORIGIN_LABEL: Record<BoletoOrigin, { label: string; icon: string }> = {
  whatsapp: { label: "WhatsApp", icon: "chat" },
  telegram: { label: "Telegram", icon: "send" },
  email: { label: "E-mail", icon: "mail" },
  upload: { label: "Upload", icon: "plus" },
  manual: { label: "Manual", icon: "edit" },
  auto: { label: "Hub auto", icon: "bot" },
}

export function daysUntil(iso: string): number {
  const due = new Date(iso)
  const now = new Date(today)
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
