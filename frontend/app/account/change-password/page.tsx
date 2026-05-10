"use client"
/**
 * Sprint H — troca da própria senha.
 *
 * Validação client-side: nova senha mínimo 12 chars com letras + números.
 * Backend valida de novo (current_password, must_change_password etc).
 */
import { useState } from "react"
import { useRouter } from "next/navigation"

import { TopBar } from "@/components/TopBar"
import { TextInput, FormField } from "@/components/ui/FormField"
import { authApi } from "@/lib/auth-api"
import { useAuthStore } from "@/stores/authStore"
import { ApiError } from "@/lib/api"

const MIN_LEN = 12

function validateNewPassword(pwd: string): string | null {
  if (pwd.length < MIN_LEN) return `Mínimo ${MIN_LEN} caracteres.`
  if (!/[a-zA-Z]/.test(pwd)) return "Inclua pelo menos uma letra."
  if (!/[0-9]/.test(pwd)) return "Inclua pelo menos um número."
  return null
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const v = validateNewPassword(next)
    if (v) {
      setError(v)
      return
    }
    if (next !== confirm) {
      setError("A confirmação não confere.")
      return
    }

    setSubmitting(true)
    try {
      await authApi.changePassword({
        current_password: current,
        new_password: next,
      })
      // Atualiza o user em memória pra refletir must_change_password=false
      try {
        const refreshed = await authApi.me()
        setUser(refreshed)
      } catch {
        // ignora — pelo menos a troca foi
      }
      router.push("/")
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400) setError(err.message || "Senha atual incorreta.")
        else setError(err.message)
      } else {
        setError("Falha ao trocar senha.")
      }
      setSubmitting(false)
    }
  }

  return (
    <>
      <TopBar
        title="Trocar senha"
        subtitle={user?.email ?? "Felipe Hub · Conta"}
      />

      <div className="flex-1 overflow-y-auto px-6 py-[22px]">
        <form onSubmit={onSubmit} className="max-w-md flex flex-col gap-3">
          <div className="bg-card border border-hair rounded-lg p-5">
            {user?.must_change_password && (
              <div className="text-[12px] text-warning bg-warning-subtle border border-warning/30 rounded-md px-3 py-2 mb-3">
                Você está usando uma senha temporária. Defina uma nova senha
                pra continuar.
              </div>
            )}

            <FormField label="Senha atual" required>
              <TextInput
                type="password"
                autoComplete="current-password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </FormField>
            <FormField
              label="Nova senha"
              required
              hint={`Mínimo ${MIN_LEN} caracteres com letras e números.`}
            >
              <TextInput
                type="password"
                autoComplete="new-password"
                required
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            </FormField>
            <FormField label="Confirmar nova senha" required>
              <TextInput
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </FormField>

            {error && (
              <div className="text-[12px] text-err bg-err/10 border border-err/30 rounded-md px-3 py-2 mt-2">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={submitting || !current || !next || !confirm}
                className="inline-flex items-center gap-1.5 bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Salvando…" : "Trocar senha"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
