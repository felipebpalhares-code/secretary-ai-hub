export type ChatAgent = "silva" | "ricardo" | "ana" | "clara" | "eng" | "diretor" | "marcos" | "carlos"

export type ChatMessage =
  | {
      kind: "agent"
      agent: ChatAgent
      time: string
      content: React.ReactNode
      urgent?: boolean
    }
  | { kind: "user"; content: string; time: string }
  | { kind: "system"; text: string; variant?: "default" | "briefing" }
  | { kind: "a2a"; text: string }

export type Conversation = {
  id: string
  title: string
  preview: string
  time: string
  emoji: string
  badge?: { count: number; variant: "alert" | "amber" | "default" }
}

export const CONVERSATIONS: { period: string; items: Conversation[] }[] = [
  {
    period: "Hoje",
    items: [
      {
        id: "briefing",
        title: "Briefing Diário",
        preview: "Clara: 3 emails urgentes...",
        time: "07:00",
        emoji: "🌅",
        badge: { count: 5, variant: "amber" },
      },
      {
        id: "silva",
        title: "Dr. Silva",
        preview: "Prazo em 12 dias · 05/05",
        time: "2h",
        emoji: "⚖️",
        badge: { count: 1, variant: "alert" },
      },
    ],
  },
  {
    period: "Ontem",
    items: [
      {
        id: "reuniao-sp",
        title: "Reunião: Terreno SP",
        preview: "ATA gerada · 3 participantes",
        time: "ontem",
        emoji: "🏛️",
      },
      {
        id: "saude-fin",
        title: "Saúde financeira",
        preview: "CDB rendeu R$312 esse mês",
        time: "ontem",
        emoji: "💰",
      },
    ],
  },
  {
    period: "Esta semana",
    items: [
      {
        id: "obras",
        title: "Status das obras",
        preview: "Bloco C 67% · 8% acima",
        time: "2d",
        emoji: "🏗️",
      },
    ],
  },
]

export const AGENT_INFO: Record<ChatAgent, { emoji: string; name: string; color: string; nameColor: string }> = {
  silva: { emoji: "⚖️", name: "Dr. Silva", color: "border-l-purple-600", nameColor: "text-purple-700" },
  ricardo: { emoji: "💰", name: "Ricardo", color: "border-l-ok", nameColor: "text-ok" },
  ana: { emoji: "🌸", name: "Ana", color: "border-l-pink-500", nameColor: "text-pink-700" },
  clara: { emoji: "✉️", name: "Clara", color: "border-l-accent", nameColor: "text-accent" },
  eng: { emoji: "🏗️", name: "Engenheiro", color: "border-l-orange-500", nameColor: "text-orange-700" },
  diretor: { emoji: "🏢", name: "Diretor", color: "border-l-blue-600", nameColor: "text-blue-700" },
  marcos: { emoji: "🏛️", name: "Marcos", color: "border-l-warn", nameColor: "text-amber-700" },
  carlos: { emoji: "🩺", name: "Dr. Carlos", color: "border-l-err", nameColor: "text-err" },
}

export const FEED_ITEMS: {
  id: string
  from: ChatAgent
  to: ChatAgent
  msg: string
  status: "done" | "pending"
  statusText: string
  time: string
  unread?: boolean
}[] = [
  { id: "f1", from: "silva", to: "ana", msg: "Bloqueie agenda 3 dias antes do prazo (02–04/05)", status: "done", statusText: "Ana confirmou", time: "08:33", unread: true },
  { id: "f2", from: "silva", to: "ricardo", msg: "Verificar verba para custas R$ 1.800", status: "done", statusText: "Verba disponível", time: "08:33", unread: true },
  { id: "f3", from: "clara", to: "ana", msg: "Email Acme com prazo hoje · adicionar agenda", status: "done", statusText: "Agenda atualizada", time: "08:10" },
  { id: "f4", from: "eng", to: "ricardo", msg: "Bloco C 8% acima (R$ 24k) · incluir no relatório?", status: "pending", statusText: "Aguardando Ricardo", time: "07:30" },
  { id: "f5", from: "eng", to: "diretor", msg: "Bloco C atraso 12 dias (chuva) · reunião hoje 14h", status: "done", statusText: "Diretor ciente", time: "07:01" },
  { id: "f6", from: "diretor", to: "ricardo", msg: "Pedido R$ 85k aguardando · verificar fluxo", status: "pending", statusText: "Aguardando aprovação", time: "07:02" },
  { id: "f7", from: "marcos", to: "silva", msg: "Certidão negativa vence em 12d · pode afetar licitação", status: "pending", statusText: "Silva analisando", time: "06:55" },
]
