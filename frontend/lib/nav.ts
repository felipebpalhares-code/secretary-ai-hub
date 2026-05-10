import type { FeatureKey } from "./features"

export type NavItem = {
  href: string
  label: string
  icon: string
  count?: number | string
  countVariant?: "default" | "alert" | "notice" | "ok"
  adminOnly?: boolean
  feature?: FeatureKey
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/quem-sou-eu", label: "Quem Sou Eu", icon: "user" },
      { href: "/", label: "Painel", icon: "grid" },
      { href: "/agentes", label: "Agentes", icon: "bot" },
      { href: "/bater-papo", label: "Bater Papo", icon: "chat", feature: "baterPapo" },
    ],
  },
  {
    label: "Produtividade",
    items: [
      { href: "/financas", label: "Finanças", icon: "chart", feature: "financas" },
      { href: "/contatos", label: "Contatos", icon: "users" },
      { href: "/empresas", label: "Empresas", icon: "building" },
      { href: "/agenda", label: "Agenda", icon: "calendar", feature: "agenda" },
      { href: "/tarefas", label: "Tarefas", icon: "check-square" },
    ],
  },
  {
    label: "Organização",
    items: [
      { href: "/bancos", label: "Bancos", icon: "bank" },
      { href: "/documentos", label: "Documentos", icon: "file", feature: "documentos" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/configuracoes", label: "Configurações", icon: "settings" },
      { href: "/admin/users", label: "Usuários", icon: "users", adminOnly: true },
    ],
  },
]
