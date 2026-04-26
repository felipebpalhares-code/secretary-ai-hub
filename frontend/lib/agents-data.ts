export type AgentTone =
  | "silva"
  | "ricardo"
  | "eng"
  | "ana"
  | "diretor"
  | "marcos"
  | "clara"
  | "carlos"

export type AgentLevel = "master" | "expert" | "senior" | "basic"

export type Agent = {
  id: string
  name: string
  title: string
  specialty: string
  emoji: string
  tone: AgentTone
  level: AgentLevel
  docs: number
  books: number
  instructions: number
  online: boolean
  activity: string
}

export const AGENTS: Agent[] = [
  {
    id: "silva",
    name: "Dr. Silva",
    title: "Advogado Pessoal",
    specialty: "Jurídico",
    emoji: "⚖️",
    tone: "silva",
    level: "master",
    docs: 12,
    books: 3,
    instructions: 5,
    online: true,
    activity: "Ativo · há 2h · prazo processual alertado",
  },
  {
    id: "ricardo",
    name: "Ricardo",
    title: "CFO Pessoal",
    specialty: "Financeiro",
    emoji: "💰",
    tone: "ricardo",
    level: "expert",
    docs: 8,
    books: 4,
    instructions: 4,
    online: true,
    activity: "Ativo · há 1h · relatório mensal gerado",
  },
  {
    id: "eng",
    name: "Engenheiro",
    title: "Gestor de Obras · Vimar",
    specialty: "Construção",
    emoji: "🏗️",
    tone: "eng",
    level: "senior",
    docs: 6,
    books: 2,
    instructions: 3,
    online: true,
    activity: "Ativo · ontem · cronograma Bloco C atualizado",
  },
  {
    id: "ana",
    name: "Ana",
    title: "Assistente Familiar e Agenda",
    specialty: "Família",
    emoji: "🌸",
    tone: "ana",
    level: "senior",
    docs: 4,
    books: 1,
    instructions: 6,
    online: true,
    activity: "Ativo · há 3h · aniversário Ana amanhã lembrado",
  },
  {
    id: "diretor",
    name: "Diretor",
    title: "Consultor Empresarial",
    specialty: "Empresas",
    emoji: "🏢",
    tone: "diretor",
    level: "expert",
    docs: 9,
    books: 5,
    instructions: 4,
    online: true,
    activity: "Ativo · hoje · obrigação societária alertada",
  },
  {
    id: "marcos",
    name: "Marcos",
    title: "Especialista Governamental",
    specialty: "Governo",
    emoji: "🏛️",
    tone: "marcos",
    level: "basic",
    docs: 2,
    books: 0,
    instructions: 2,
    online: false,
    activity: "Inativo · 3 dias · certidão vencendo em 12d",
  },
  {
    id: "clara",
    name: "Clara",
    title: "Assistente de Comunicação",
    specialty: "E-mails",
    emoji: "✉️",
    tone: "clara",
    level: "senior",
    docs: 3,
    books: 2,
    instructions: 5,
    online: true,
    activity: "Ativo · há 20min · 3 emails priorizados",
  },
  {
    id: "carlos",
    name: "Dr. Carlos",
    title: "Médico de Confiança",
    specialty: "Saúde",
    emoji: "🩺",
    tone: "carlos",
    level: "basic",
    docs: 2,
    books: 1,
    instructions: 2,
    online: false,
    activity: "Inativo · 5 dias · check-up anual pendente",
  },
]
