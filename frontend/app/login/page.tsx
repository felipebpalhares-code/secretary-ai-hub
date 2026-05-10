"use client"
/**
 * Sprint H — tela de login.
 * Renderiza standalone (sem Sidebar) via LayoutShell que detecta /login.
 */
import { useState } from "react"
import { useRouter } from "next/navigation"

import { authApi } from "@/lib/auth-api"
import { ApiError } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"
import { TextInput } from "@/components/ui/FormField"

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { user } = await authApi.login({ email, password })
      setUser(user)
      if (user.must_change_password) {
        router.push("/account/change-password")
      } else {
        router.push("/")
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Credenciais inválidas")
      } else {
        setError("Erro ao fazer login. Tente novamente.")
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm bg-card border border-hair rounded-lg shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold tracking-[-.02em]">
            FH
          </div>
          <div>
            <div className="text-[15px] font-bold text-ink tracking-[-.25px]">Felipe Hub</div>
            <div className="text-[11px] text-ink-3 font-medium mt-px">Acesse sua conta</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-1.5">
              E-mail
            </label>
            <TextInput
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-1.5">
              Senha
            </label>
            <TextInput
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-[12px] text-err bg-err/10 border border-err/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="mt-2 inline-flex items-center justify-center gap-1.5 bg-accent text-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-[11px] text-ink-3 text-center">
          Esqueceu a senha? Peça reset ao administrador.
        </div>
      </div>
    </div>
  )
}
