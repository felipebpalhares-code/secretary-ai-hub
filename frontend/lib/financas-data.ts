export type EntityBadge = "pf" | "pj" | "hold" | "obra" | "cc" | "carta" | "contemp" | "lance"

export type TreeNode = {
  id: string
  label: string
  icon?: string
  badge?: EntityBadge
  meta?: string
  children?: TreeNode[]
}

export const TREE: TreeNode[] = [
  { id: "consolidado", label: "Visão Geral", icon: "▦", meta: "R$ 3,2M" },
]

export const TREE_PF: TreeNode[] = [
  {
    id: "felipe-pf",
    label: "Felipe Palhares",
    badge: "pf",
    children: [
      { id: "moradia", label: "Moradia", badge: "cc" },
      { id: "familia", label: "Família", badge: "cc" },
      { id: "saude", label: "Saúde", badge: "cc" },
      { id: "lazer", label: "Lazer", badge: "cc" },
      { id: "invest", label: "Investimentos", badge: "cc" },
    ],
  },
]

export const TREE_EMPRESAS: TreeNode[] = [
  {
    id: "palharestech",
    label: "PalharesTech",
    badge: "pj",
    children: [
      { id: "dev", label: "Dev", badge: "cc" },
      { id: "mkt", label: "Marketing", badge: "cc" },
      { id: "vendas-pt", label: "Vendas", badge: "cc" },
      { id: "admin-pt", label: "Admin", badge: "cc" },
      { id: "infra", label: "Infra / Cloud", badge: "cc" },
    ],
  },
  {
    id: "braz",
    label: "Distribuidora Braz",
    badge: "pj",
    children: [
      { id: "logistica", label: "Logística", badge: "cc" },
      { id: "armazem", label: "Armazém", badge: "cc" },
      { id: "vendas-br", label: "Vendas", badge: "cc" },
    ],
  },
]

export const TREE_VIMAR: TreeNode[] = [
  {
    id: "vimar",
    label: "Vimar Empreendimentos",
    badge: "hold",
    children: [
      { id: "obra-a", label: "Bloco A · Residencial", badge: "obra" },
      { id: "obra-b", label: "Bloco B · Comercial SP", badge: "obra" },
      { id: "obra-c", label: "Bloco C · Condomínio", badge: "obra" },
      { id: "obra-d", label: "Bloco D · Praia", badge: "obra" },
    ],
  },
]

export const TREE_CARTAS: TreeNode[] = [
  {
    id: "cartas",
    label: "Consórcios ativos",
    meta: "4",
    children: [
      { id: "porto", label: "Porto Seguro #8472", badge: "lance" },
      { id: "bb", label: "BB Consórcio #1023", badge: "contemp" },
      { id: "itau", label: "Itaú Imóveis #5501", badge: "carta" },
      { id: "bradesco", label: "Bradesco Veículos #332", badge: "carta" },
    ],
  },
]
