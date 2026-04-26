export type ContactTag = { label: string; variant: "neutral" | "indigo" | "green" | "amber" | "red" | "gray" }

export type Contact = {
  id: string
  initials: string
  avatarTone: "slate" | "slate2" | "slate3" | "slate4" | "indigo" | "indigo2" | "emerald" | "zinc" | "zinc2"
  online: boolean
  name: string
  starred?: boolean
  role: string
  tags: ContactTag[]
  lastActivity: string
  category: "familia" | "socios" | "profissionais" | "negocios"
  // Detalhes do contato
  fullRole?: string
  city?: string
  birthday?: string
  phone?: string
  email?: string
  address?: string
  cpfMasked?: string
  // Timeline (últimas interações)
  timeline?: {
    icon: "chat" | "mail" | "calendar" | "phone"
    title: string
    sub: string
    time: string
  }[]
  // Vínculos no hub
  links?: { icon: "calendar" | "money" | "file" | "chart" | "users" | "target"; n: string; m: string }[]
  // Agente responsável
  agent?: { name: string; role: string; emoji: string }
  // Notas privadas
  notes?: string
}

export const CONTACTS: Contact[] = [
  {
    id: "ana",
    initials: "A",
    avatarTone: "slate",
    online: true,
    name: "Ana Carolina",
    starred: true,
    role: "Esposa · Curitiba",
    tags: [
      { label: "Família", variant: "neutral" },
      { label: "Aniversário amanhã", variant: "amber" },
    ],
    lastActivity: "WhatsApp · há 2h",
    category: "familia",
    fullRole: "Esposa · Curitiba, PR",
    birthday: "22/08 · amanhã",
    phone: "(41) 99876-5432",
    email: "ana.palhares@email.com",
    address: "Av. Batel, 1234",
    timeline: [
      { icon: "chat", title: '"Tô chegando, amor"', sub: "WhatsApp · via Felipe Hub", time: "há 2h" },
      { icon: "calendar", title: "Jantar Mistura Oficial", sub: "Aniversário · amanhã 20h", time: "ontem" },
      { icon: "mail", title: "Foto do recital da Sofia", sub: "E-mail · 12 fotos", time: "3 dias atrás" },
      { icon: "phone", title: "Ligação · 12 min", sub: "Planejamento viagem julho", time: "1 semana atrás" },
    ],
    links: [
      { icon: "calendar", n: "Jantar Mistura Oficial", m: "Agenda · Amanhã 20h" },
      { icon: "target", n: "Presente em planejamento", m: "Ana (agente) · 3 opções" },
      { icon: "file", n: "Procuração pública 2023", m: "Documentos · Jurídico" },
      { icon: "chart", n: "Conta conjunta Itaú", m: "Finanças · Felipe PF" },
    ],
    agent: { name: "Ana (agente)", role: "Cuida da agenda familiar e lembretes", emoji: "🌸" },
    notes:
      "Ana prefere flores do campo a rosas. Alergia a frutos do mar. Adora viagens de descoberta, não roteiros prontos. Sempre agradecer no Instagram em datas especiais.",
  },
  {
    id: "mateus",
    initials: "M",
    avatarTone: "slate2",
    online: true,
    name: "Mateus Palhares",
    role: "Filho · 12 anos · Col. Marista",
    tags: [{ label: "Família", variant: "neutral" }],
    lastActivity: "Atividade escolar sex",
    category: "familia",
    fullRole: "Filho · 12 anos · Colégio Marista Rosário",
    birthday: "05/03",
    phone: "Sem telefone próprio",
    email: "—",
    address: "Av. Batel, 1234",
    timeline: [
      { icon: "calendar", title: "Apresentação portfólio ciências", sub: "Agenda · sexta às 14h", time: "amanhã" },
      { icon: "phone", title: "Reunião escola — Prof. Roberta", sub: "Ana acompanhou", time: "5 dias atrás" },
    ],
    links: [
      { icon: "calendar", n: "Atividade escolar sexta", m: "Agenda · 25/04 14h" },
      { icon: "users", n: "Dr. Pedro Almeida", m: "Médico · Pediatra" },
      { icon: "money", n: "Mensalidade Marista", m: "Finanças · R$ 3.200/mês" },
    ],
    agent: { name: "Ana (agente)", role: "Acompanha rotina e saúde dos filhos", emoji: "🌸" },
    notes: "Adora xadrez, futebol e leitura. Alergia a amendoim. Treina natação 3× por semana.",
  },
  {
    id: "sofia",
    initials: "S",
    avatarTone: "slate3",
    online: true,
    name: "Sofia Palhares",
    role: "Filha · 8 anos · Col. Positivo",
    tags: [{ label: "Família", variant: "neutral" }],
    lastActivity: "Próx aniversário: 14/09",
    category: "familia",
  },
  {
    id: "jose-pai",
    initials: "J",
    avatarTone: "slate4",
    online: false,
    name: "José Braz",
    role: "Pai · Aposentado",
    tags: [{ label: "Família", variant: "neutral" }],
    lastActivity: "Ligação há 4 dias",
    category: "familia",
  },
  {
    id: "joao-santos",
    initials: "J",
    avatarTone: "indigo",
    online: true,
    name: "João Santos",
    starred: true,
    role: "Sócio PalharesTech · 30%",
    tags: [{ label: "PalharesTech", variant: "indigo" }],
    lastActivity: "WhatsApp ontem",
    category: "socios",
    fullRole: "Sócio-fundador PalharesTech · CTO · 30%",
    city: "Curitiba, PR",
    birthday: "14/11",
    phone: "(41) 98765-4321",
    email: "joao@palharestech.com.br",
    cpfMasked: "***.456.789-**",
    timeline: [
      { icon: "chat", title: "Discussão técnica novo módulo", sub: "WhatsApp · Diretor mediou", time: "ontem" },
      { icon: "mail", title: "Proposta arquitetura nuvem", sub: "E-mail · 4 anexos", time: "3 dias atrás" },
      { icon: "calendar", title: "Reunião sócios mensal", sub: "Hub · ATA gerada", time: "1 semana atrás" },
    ],
    links: [
      { icon: "users", n: "Quadro societário", m: "PalharesTech · 30%" },
      { icon: "money", n: "Distribuição de lucros", m: "Finanças · Q1 R$ 87k" },
      { icon: "file", n: "Contrato social atualizado", m: "Documentos · Empresas" },
    ],
    agent: { name: "Diretor (agente)", role: "Cuida das relações societárias", emoji: "🏢" },
    notes:
      "Engenheiro de formação, focado em produto. Decisões grandes prefere conversar pessoalmente. Frequenta os mesmos eventos de tecnologia que eu.",
  },
  {
    id: "paulo-mendonca",
    initials: "P",
    avatarTone: "zinc",
    online: false,
    name: "Paulo Mendonça",
    role: "Sócio Vimar · 20%",
    tags: [{ label: "Vimar", variant: "neutral" }],
    lastActivity: "Ligação há 1 semana",
    category: "socios",
  },
  {
    id: "jose-ferreira",
    initials: "J",
    avatarTone: "emerald",
    online: true,
    name: "José Ferreira",
    starred: true,
    role: "Contador · CRC 12345-PR",
    tags: [
      { label: "Contador", variant: "green" },
      { label: "Aniversário 3d", variant: "amber" },
    ],
    lastActivity: "E-mail hoje · relatório fiscal",
    category: "profissionais",
    fullRole: "Contador · CRC 12345-PR · Ferreira & Associados",
    city: "Curitiba, PR",
    birthday: "27/04 · 3 dias",
    phone: "(41) 3322-1100",
    email: "jose@ferreiraassociados.com.br",
    timeline: [
      { icon: "mail", title: "Relatório fiscal Q1 2026", sub: "PalharesTech + Braz · 3 anexos", time: "hoje" },
      { icon: "phone", title: "DARF IRPJ confirmado", sub: "Agendou pagamento p/ 30/04", time: "ontem" },
      { icon: "mail", title: "Folha de pagamento abril", sub: "PalharesTech · 6 funcionários", time: "5 dias atrás" },
    ],
    links: [
      { icon: "money", n: "DARF Q1/2026 · R$ 12.400", m: "Bancos · Tributos · 30/04" },
      { icon: "file", n: "Contratos de prestação de serviço", m: "Documentos · 3 contratos ativos" },
      { icon: "users", n: "Atende: PalharesTech, Braz, Felipe PF", m: "Contatos · 3 entidades" },
    ],
    agent: { name: "Marcos (agente)", role: "Trata diretamente com o contador", emoji: "🏛️" },
    notes:
      "20 anos de mercado. Cuida da contabilidade desde a fundação da PalharesTech. Filho do Ricardo Ferreira (corretor parceiro).",
  },
  {
    id: "dr-carlos-lima",
    initials: "C",
    avatarTone: "zinc2",
    online: true,
    name: "Dr. Carlos Lima",
    role: "Adv. Trabalhista · OAB/PR 54321",
    tags: [
      { label: "Advogado", variant: "neutral" },
      { label: "Prazo ativo", variant: "red" },
    ],
    lastActivity: "WhatsApp hoje · Proc. 0001234",
    category: "profissionais",
    fullRole: "Advogado Trabalhista · OAB/PR 54321 · Lima Advocacia",
    city: "Curitiba, PR",
    phone: "(41) 99812-3456",
    email: "carlos@limaadvocacia.com.br",
    timeline: [
      { icon: "chat", title: "Protocolando contestação Proc. 0001234", sub: "WhatsApp · prazo 05/05", time: "hoje · 09h" },
      { icon: "mail", title: "Minuta de defesa anexa", sub: "E-mail · revisar antes de protocolar", time: "ontem" },
      { icon: "calendar", title: "Reunião alinhamento estratégia", sub: "Presencial · escritório", time: "3 dias atrás" },
    ],
    links: [
      { icon: "file", n: "Proc. 0001234-56.2024", m: "Documentos · Reclamação Trabalhista" },
      { icon: "calendar", n: "Prazo contestação", m: "Agenda · 05/05 · 12 dias" },
      { icon: "money", n: "Honorários", m: "Finanças · R$ 8k contratuais + 20% êxito" },
    ],
    agent: { name: "Dr. Silva (agente)", role: "Acompanha e traduz andamento processual", emoji: "⚖️" },
    notes:
      "Sócio do escritório há 15 anos. Especialista em trabalhista preventivo. Sempre prefere comunicação por WhatsApp. Cobra por hora e por êxito.",
  },
  {
    id: "dr-pedro",
    initials: "P",
    avatarTone: "slate",
    online: true,
    name: "Dr. Pedro Almeida",
    role: "Pediatra · Mateus e Sofia",
    tags: [{ label: "Médico", variant: "red" }],
    lastActivity: "Consulta agendada: 15/05",
    category: "profissionais",
  },
  {
    id: "ricardo-souza",
    initials: "R",
    avatarTone: "slate3",
    online: false,
    name: "Ricardo Souza",
    role: "Corretor · CRECI 12345",
    tags: [{ label: "Vimar", variant: "neutral" }],
    lastActivity: "Mensagem há 1 semana",
    category: "profissionais",
  },
  {
    id: "joao-silva-acme",
    initials: "A",
    avatarTone: "indigo2",
    online: true,
    name: "João Silva · Acme",
    role: "Cliente · CEO",
    tags: [
      { label: "Cliente", variant: "indigo" },
      { label: "Prazo hoje", variant: "red" },
    ],
    lastActivity: "E-mail · proposta R$89k",
    category: "negocios",
    fullRole: "CEO · Acme Corporation · Cliente PalharesTech",
    city: "São Paulo, SP",
    phone: "(11) 99123-4567",
    email: "joao.silva@acme.com",
    timeline: [
      { icon: "mail", title: "Aguardando resposta da proposta R$89k", sub: "Prazo hoje · 18h", time: "agora · urgente" },
      { icon: "chat", title: "Confirmou recebimento da NF de adiantamento", sub: "WhatsApp · R$15k pagos", time: "ontem" },
      { icon: "calendar", title: "Reunião alinhamento técnico", sub: "Google Meet · 2h", time: "1 semana atrás" },
    ],
    links: [
      { icon: "money", n: "Proposta projeto XYZ · R$ 89.000", m: "Documentos · prazo hoje 18h" },
      { icon: "users", n: "Equipe Acme (CTO, PM)", m: "Contatos · 3 colaboradores" },
      { icon: "calendar", n: "Reunião kick-off", m: "Agenda · agendar para 28/04" },
    ],
    agent: { name: "Diretor (agente)", role: "Trata oportunidades e relacionamento de cliente", emoji: "🏢" },
    notes:
      "CEO direto e prático. Decide rápido. Prefere reuniões curtas e e-mails objetivos. Cliente desde 2023 — segundo grande projeto.",
  },
  {
    id: "siderurgica-sp",
    initials: "S",
    avatarTone: "zinc",
    online: false,
    name: "Siderúrgica SP",
    role: "Fornecedor · Aço e cimento",
    tags: [
      { label: "Vimar", variant: "neutral" },
      { label: "Renegociar", variant: "red" },
    ],
    lastActivity: "Gasto mês: R$96k (+12%)",
    category: "negocios",
    fullRole: "Fornecedor · Aço e cimento · Vimar Empreendimentos",
    city: "São Paulo, SP",
    phone: "(11) 4555-7800 · Carlos Mendes (vendedor)",
    email: "compras@siderurgicasp.com.br",
    timeline: [
      { icon: "mail", title: "NF 87234 · 1,2t aço CA-50 · R$24.800", sub: "E-mail · pago via PIX", time: "hoje" },
      { icon: "phone", title: "Discussão sobre aumento de preço", sub: "Engenheiro recomendou renegociar", time: "5 dias atrás" },
      { icon: "calendar", title: "Visita técnica obra Bloco C", sub: "Vendedor visitou canteiro", time: "2 semanas atrás" },
    ],
    links: [
      { icon: "money", n: "Volume mensal · R$ 96k", m: "Bancos · +12% vs mês anterior · ALERTA" },
      { icon: "file", n: "Contrato fornecimento 2026", m: "Documentos · vence 12/2026" },
      { icon: "chart", n: "Histórico de pedidos", m: "Finanças · 14 NFs no ano" },
    ],
    agent: { name: "Engenheiro (agente)", role: "Negocia preços e prazos diretamente", emoji: "🏗️" },
    notes:
      "Principal fornecedor de aço da Vimar. Subiu 14% em 4 meses sem justificativa clara. Carlos (vendedor) é flexível — vale tentar 8% de desconto na próxima compra.",
  },
  {
    id: "artcasa",
    initials: "A",
    avatarTone: "slate3",
    online: true,
    name: "ArtCasa Esquadrias",
    role: "Fornecedor · Alumínio",
    tags: [{ label: "Vimar", variant: "neutral" }],
    lastActivity: "Boleto R$32k · semana",
    category: "negocios",
  },
  {
    id: "empreiteiro",
    initials: "R",
    avatarTone: "slate2",
    online: true,
    name: "Roberto · Empreiteiro",
    role: "18 colaboradores · Bloco A",
    tags: [
      { label: "Vimar", variant: "neutral" },
      { label: "Ativo", variant: "green" },
    ],
    lastActivity: "Reunião hoje 14h",
    category: "negocios",
  },
]
