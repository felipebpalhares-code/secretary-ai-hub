export type NavItem = {
  href: string
  label: string
  icon: string
  count?: number | string
  countVariant?: "default" | "alert" | "notice" | "ok"
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
      { href: "/bater-papo", label: "Bater Papo", icon: "chat" },
    ],
  },
  {
    label: "Produtividade",
    items: [
      { href: "/financas", label: "Finanças", icon: "chart" },
      { href: "/contatos", label: "Contatos", icon: "users" },
      { href: "/agenda", label: "Agenda", icon: "calendar" },
    ],
  },
  {
    label: "Organização",
    items: [
      { href: "/bancos", label: "Bancos", icon: "bank" },
      { href: "/documentos", label: "Documentos", icon: "file" },
    ],
  },
  {
    label: "Sistema",
    items: [{ href: "/configuracoes", label: "Configurações", icon: "settings" }],
  },
]
