/**
 * Sprint H — store de autenticação.
 *
 * Mantém o user logado em memória. O cookie httpOnly access_token é a fonte
 * de verdade; este store é só cache pra UI. Em refresh da página, a tela
 * raiz chama authApi.me() pra rehidratar.
 */
import { create } from "zustand"

import type { UserResponse } from "@/lib/auth-api"
import { ADMIN_ONLY_MODULES } from "@/lib/auth-api"

interface AuthState {
  user: UserResponse | null
  isHydrating: boolean
  setUser: (u: UserResponse | null) => void
  setHydrating: (b: boolean) => void
  clearUser: () => void
  hasPermission: (module: string, action: string) => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isHydrating: true,
  setUser: (u) => set({ user: u, isHydrating: false }),
  setHydrating: (b) => set({ isHydrating: b }),
  clearUser: () => set({ user: null, isHydrating: false }),
  isAdmin: () => get().user?.role === "ADMIN",
  hasPermission: (module, action) => {
    const u = get().user
    if (!u || !u.is_active) return false
    if (u.role === "ADMIN") return true
    if (ADMIN_ONLY_MODULES.has(module)) return false
    const flags = u.permissions?.[module]
    return Boolean(flags?.[action])
  },
}))
