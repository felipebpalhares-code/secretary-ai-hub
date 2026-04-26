export type DocKind = "pdf" | "doc" | "img" | "xls"
export type DocOrigin = "whatsapp" | "telegram" | "email" | "upload" | "hub"
export type DocCategory = "juridico" | "financeiro" | "empresas" | "pessoal" | "governo" | "saude" | "obras"

export type DocTag = { label: string; variant: "gray" | "green" | "amber" | "red" | "indigo" }

export type Document = {
  id: string
  name: string
  kind: DocKind
  category: DocCategory
  origin: DocOrigin
  originMeta: string
  tags: DocTag[]
  agent: { label: string; emoji: string }
  time: string
  alert?: boolean
}

export const DOCUMENTS: Document[] = [
  {
    id: "cert-federal",
    name: "Certidao_Negativa_Federal.pdf",
    kind: "pdf",
    category: "governo",
    origin: "upload",
    originMeta: "Upload via hub",
    tags: [
      { label: "Vence 12d", variant: "red" },
      { label: "OCR", variant: "gray" },
    ],
    agent: { label: "Marcos", emoji: "🏛️" },
    time: "3 dias",
    alert: true,
  },
  {
    id: "contrato-locacao",
    name: "Contrato_Locacao_PalharesTech.pdf",
    kind: "pdf",
    category: "juridico",
    origin: "whatsapp",
    originMeta: "WhatsApp · João Silva",
    tags: [
      { label: "Vence 12/26", variant: "amber" },
      { label: "OCR", variant: "gray" },
      { label: "R$ 8.500/mês", variant: "indigo" },
    ],
    agent: { label: "Dr. Silva", emoji: "⚖️" },
    time: "2 dias",
  },
  {
    id: "boleto-nubank",
    name: "Boleto_Nubank_Abril.pdf",
    kind: "pdf",
    category: "financeiro",
    origin: "whatsapp",
    originMeta: "WhatsApp · automático",
    tags: [
      { label: "Vence amanhã", variant: "red" },
      { label: "R$ 3.240", variant: "indigo" },
    ],
    agent: { label: "Ricardo", emoji: "💰" },
    time: "6h",
    alert: true,
  },
  {
    id: "planta-bloco-c",
    name: "Planta_Bloco_C_Vimar_v3.dwg",
    kind: "img",
    category: "obras",
    origin: "telegram",
    originMeta: "Telegram · 43 MB",
    tags: [
      { label: "v3", variant: "indigo" },
      { label: "Arquivo grande", variant: "gray" },
    ],
    agent: { label: "Engenheiro", emoji: "🏗️" },
    time: "1 semana",
  },
  {
    id: "cnh",
    name: "CNH_Felipe_Frente.jpg",
    kind: "img",
    category: "pessoal",
    origin: "whatsapp",
    originMeta: "WhatsApp · foto",
    tags: [
      { label: "OCR extraído", variant: "green" },
      { label: "Vence 45d", variant: "amber" },
    ],
    agent: { label: "Marcos", emoji: "🏛️" },
    time: "10 dias",
  },
  {
    id: "ata-terreno",
    name: "ATA_Reuniao_Terreno_SP.pdf",
    kind: "doc",
    category: "empresas",
    origin: "hub",
    originMeta: "Hub · reunião",
    tags: [
      { label: "3 participantes", variant: "indigo" },
      { label: "2 decisões", variant: "green" },
    ],
    agent: { label: "Diretor", emoji: "🏢" },
    time: "ontem",
  },
  {
    id: "proposta-acme",
    name: "Proposta_Acme_v2.docx",
    kind: "doc",
    category: "empresas",
    origin: "email",
    originMeta: "E-mail · joao@acme.com",
    tags: [
      { label: "v2", variant: "indigo" },
      { label: "Assinatura", variant: "amber" },
      { label: "R$ 89.000", variant: "indigo" },
    ],
    agent: { label: "Clara", emoji: "✉️" },
    time: "2h",
  },
  {
    id: "exame",
    name: "Exame_Cardiologico_2026.pdf",
    kind: "pdf",
    category: "saude",
    origin: "whatsapp",
    originMeta: "WhatsApp · laboratório",
    tags: [
      { label: "Normal", variant: "green" },
      { label: "OCR", variant: "gray" },
    ],
    agent: { label: "Dr. Carlos", emoji: "🩺" },
    time: "2 semanas",
  },
  {
    id: "fluxo-caixa",
    name: "Fluxo_Caixa_Abril_2026.xlsx",
    kind: "xls",
    category: "financeiro",
    origin: "hub",
    originMeta: "Hub · automático",
    tags: [
      { label: "R$ 487k", variant: "green" },
      { label: "24 abas", variant: "gray" },
    ],
    agent: { label: "Ricardo", emoji: "💰" },
    time: "ontem",
  },
]
