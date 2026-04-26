export type EventColor = "blue" | "red" | "purple" | "green" | "orange" | "pink" | "amber" | "indigo"

export type Event = {
  id: string
  title: string
  time: string
  color: EventColor
  day: number // 0 = Mon
  top: number
  height: number
  // Detalhes
  category?: string
  categoryVariant?: "blue" | "red" | "purple" | "green" | "orange" | "pink" | "amber" | "indigo"
  whenLong?: string
  location?: string
  parent?: string // ex: "Bloco A · Residencial Curitiba"
  reminder?: string
  recurrence?: string
  participants?: { name: string; initials: string }[]
  agenda?: string[] // bullets da pauta
  links?: { icon: "chart" | "users" | "file" | "money" | "calendar"; n: string; m: string }[]
  agent?: { name: string; emoji: string; role: string }
  notes?: string
}

export const WEEK_EVENTS: Event[] = [
  // Mon 20
  { id: "e1", title: "Planejamento Q2", time: "10:00–11:00", color: "blue", day: 0, top: 112, height: 52 },
  { id: "e2", title: "Obra Bloco C · vistoria", time: "16:00–17:20", color: "orange", day: 0, top: 448, height: 75 },
  // Tue 21
  {
    id: "e3",
    title: "Prazo proc. 0001234",
    time: "09:00 · Dr. Carlos",
    color: "red",
    day: 1,
    top: 56,
    height: 38,
    category: "Prazo jurídico",
    categoryVariant: "red",
    whenLong: "Terça · 09:00 (deadline · não tem hora marcada)",
    parent: "Reclamação Trabalhista · 0001234-56.2024",
    reminder: "1 dia antes · WhatsApp + e-mail",
    participants: [
      { name: "Felipe", initials: "F" },
      { name: "Dr. Carlos Lima", initials: "C" },
      { name: "Dr. Silva (agente)", initials: "S" },
    ],
    agenda: [
      "Confirmar protocolo da contestação até 12h",
      "Revisar minuta enviada pelo Dr. Carlos",
      "Verificar se foi anexada toda documentação trabalhista",
    ],
    links: [
      { icon: "file", n: "Proc. 0001234-56.2024", m: "Documentos · Reclamação trabalhista" },
      { icon: "users", n: "Dr. Carlos Lima", m: "Contatos · Advogado" },
      { icon: "money", n: "Custas processuais", m: "Bancos · R$ 1.800 reservado" },
    ],
    agent: {
      name: "Dr. Silva (agente)",
      emoji: "⚖️",
      role: "Confirma protocolo na hora · alerta se houver atraso · registra desfecho",
    },
    notes: "PRAZO LEGAL · perder = revelia. Valor pedido R$45k pode ser concedido sem defesa.",
  },
  { id: "e4", title: "Reunião contador", time: "13:00–14:00", color: "green", day: 1, top: 280, height: 52 },
  // Wed 22
  { id: "e5", title: "Call João · PalharesTech", time: "08:30–09:40", color: "purple", day: 2, top: 28, height: 66 },
  { id: "e6", title: "Visita terreno Bloco D", time: "12:00–13:00", color: "orange", day: 2, top: 224, height: 52 },
  { id: "e7", title: "Academia", time: "17:00–18:30", color: "indigo", day: 2, top: 504, height: 84 },
  // Thu 23
  { id: "e8", title: "Assinar Acme", time: "09:30 · R$89k", color: "green", day: 3, top: 84, height: 42 },
  { id: "e9", title: "Mateus · recital", time: "15:00–16:15", color: "pink", day: 3, top: 392, height: 56 },
  // Fri 24 (today)
  { id: "e10", title: "Call equipe produto", time: "13:00–13:50", color: "blue", day: 4, top: 280, height: 46 },
  {
    id: "e11",
    title: "Reunião empreiteiro · Bloco A",
    time: "14:00–15:15",
    color: "orange",
    day: 4,
    top: 336,
    height: 70,
    category: "Obras · Vimar",
    categoryVariant: "orange",
    whenLong: "Hoje · 14:00–15:15 (1h 15min)",
    location: "Canteiro Bloco A · Av. Batel",
    parent: "Bloco A · Residencial Curitiba",
    reminder: "30min antes · WhatsApp",
    recurrence: "Não se repete",
    participants: [
      { name: "Felipe", initials: "F" },
      { name: "Roberto · Empreiteiro", initials: "R" },
      { name: "Engenheiro (agente)", initials: "E" },
    ],
    agenda: [
      "Revisar cronograma Bloco C (8% acima)",
      "Renegociar preço do aço (Siderúrgica SP)",
      "Ajustar folha quinzenal",
      "Alinhar entregas Bloco A fase alvenaria",
    ],
    links: [
      { icon: "chart", n: "Obra Bloco A", m: "Finanças · 67% concluída" },
      { icon: "users", n: "Roberto Silva", m: "Contatos · Empreiteiro" },
      { icon: "file", n: "Planilha de desvio", m: "Documentos · Ricardo hoje" },
    ],
    agent: {
      name: "Engenheiro (agente)",
      emoji: "🏗️",
      role: "Vai preparar planilha de custo e levar lista de renegociação. Registra ata após reunião.",
    },
    notes:
      "Empreiteiro disse que atraso foi por chuva — verificar se justifica ou se precisa outro fornecedor. Se passar de 10% desvio, ativar plano B.",
  },
  { id: "e12", title: "Review semanal", time: "17:00–18:00", color: "blue", day: 4, top: 504, height: 52 },
  {
    id: "e13",
    title: "Jantar Ana · Mistura",
    time: "20:00–21:30",
    color: "pink",
    day: 4,
    top: 672,
    height: 85,
    category: "Família · Aniversário",
    categoryVariant: "pink",
    whenLong: "Hoje · 20:00–21:30 (1h 30min) · Aniversário Ana",
    location: "Restaurante Mistura Oficial · Batel",
    reminder: "1h antes · WhatsApp",
    recurrence: "Anual",
    participants: [
      { name: "Felipe", initials: "F" },
      { name: "Ana Carolina", initials: "A" },
      { name: "Mateus", initials: "M" },
      { name: "Sofia", initials: "S" },
    ],
    agenda: [
      "Reserva confirmada para 4 pessoas (mesa janela)",
      "Cardápio degustação · vinho Casa Valduga",
      "Presente: 3 opções em planejamento (Ana agente)",
      "Foto pra postar no Instagram (lembrar tag dela)",
    ],
    links: [
      { icon: "users", n: "Ana Carolina", m: "Contatos · Esposa" },
      { icon: "file", n: "Reserva confirmada · Mistura Oficial", m: "Documentos · e-mail anexo" },
    ],
    agent: {
      name: "Ana (agente)",
      emoji: "🌸",
      role: "Reservou mesa · está finalizando 3 opções de presente · vai lembrar 1h antes",
    },
    notes: "Ana adora vinho tinto encorpado. Já avisou que não quer surpresa de festa surpresa.",
  },
  // Sat 25
  { id: "e14", title: "Família · parque", time: "09:30–12:00", color: "pink", day: 5, top: 84, height: 112 },
  // Sun 26
  { id: "e15", title: "Tempo de leitura", time: "08:30–10:00", color: "amber", day: 6, top: 28, height: 85 },
]
