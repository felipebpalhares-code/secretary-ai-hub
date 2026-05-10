/**
 * Sprint H — cliente HTTP de autenticação e gestão de usuários.
 * Cookies httpOnly viajam automaticamente via credentials: 'include' no api.ts.
 */
import { request } from "./api"

export type UserRole = "ADMIN" | "ASSISTANT"
export type ActionFlags = Record<string, boolean>
export type PermissionMap = Record<string, ActionFlags>

export interface UserResponse {
  id: number
  email: string
  name: string
  role: UserRole
  permissions: PermissionMap
  is_active: boolean
  must_change_password: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface UserCreatePayload {
  email: string
  name: string
  role: UserRole
  permissions: PermissionMap
}

export interface UserUpdatePayload {
  name?: string
  role?: UserRole
  permissions?: PermissionMap
  is_active?: boolean
}

export interface LoginResponse {
  user: UserResponse
}

export interface UserCreatedResponse {
  user: UserResponse
  temporary_password: string
}

export interface TemporaryPasswordResponse {
  temporary_password: string
}

/* ───────── /api/auth ───────── */

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  me: () => request<UserResponse>("/api/auth/me"),
  changePassword: (payload: ChangePasswordPayload) =>
    request<void>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
}

/* ───────── /api/users (admin-only) ───────── */

export const usersApi = {
  list: () => request<UserResponse[]>("/api/users"),
  create: (payload: UserCreatePayload) =>
    request<UserCreatedResponse>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: UserUpdatePayload) =>
    request<UserResponse>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  resetPassword: (id: number) =>
    request<TemporaryPasswordResponse>(`/api/users/${id}/reset-password`, {
      method: "POST",
    }),
  remove: (id: number) =>
    request<void>(`/api/users/${id}`, { method: "DELETE" }),
}

/* ───────── Catálogo de módulos (UI permissions editor) ───────── */

export interface ModuleSpec {
  key: string
  label: string
  actions: { key: string; label: string }[]
  adminOnly?: boolean
}

/**
 * Módulos que aparecem na tela de gestão de permissões. Match com o backend
 * em models/user.py DEFAULT_ASSISTANT_PERMISSIONS — mantido manualmente.
 * configuracoes/usuarios são admin-only e não devem ser editáveis pra ASSISTANT.
 */
export const PERMISSION_MODULES: ModuleSpec[] = [
  {
    key: "contatos",
    label: "Contatos",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
      { key: "deletar", label: "Deletar" },
    ],
  },
  {
    key: "empresas",
    label: "Empresas",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
      { key: "deletar", label: "Deletar" },
    ],
  },
  {
    key: "agenda",
    label: "Agenda",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
      { key: "deletar", label: "Deletar" },
    ],
  },
  {
    key: "tarefas",
    label: "Tarefas",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
      { key: "deletar", label: "Deletar" },
    ],
  },
  {
    key: "agentes",
    label: "Agentes IA",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
      { key: "deletar", label: "Deletar" },
    ],
  },
  {
    key: "bancos",
    label: "Bancos",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "editar", label: "Editar" },
    ],
  },
  {
    key: "quem-sou-eu",
    label: "Quem Sou Eu",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
      { key: "deletar", label: "Deletar" },
    ],
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    actions: [
      { key: "ver", label: "Ver" },
      { key: "enviar", label: "Enviar" },
    ],
  },
]

export const ADMIN_ONLY_MODULES = new Set(["configuracoes", "usuarios"])
