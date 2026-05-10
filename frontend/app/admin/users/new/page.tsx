"use client"
/**
 * Sprint H — criar novo usuário (admin-only).
 */
import { useState } from "react"
import { useRouter } from "next/navigation"

import { TopBar, Button } from "@/components/TopBar"
import { TextInput, Select, FormField } from "@/components/ui/FormField"
import { AdminOnlyPage } from "@/components/auth/AdminOnlyPage"
import {
  PermissionsEditor,
  emptyPermissions,
} from "@/components/admin/PermissionsEditor"
import { TemporaryPasswordModal } from "@/components/admin/TemporaryPasswordModal"
import {
  usersApi,
  type PermissionMap,
  type UserRole,
} from "@/lib/auth-api"
import { ApiError } from "@/lib/api"

export default function NewUserPage() {
  return (
    <AdminOnlyPage>
      <NewUserForm />
    </AdminOnlyPage>
  )
}

function NewUserForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("ASSISTANT")
  const [permissions, setPermissions] = useState<PermissionMap>(emptyPermissions())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [createdEmail, setCreatedEmail] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { temporary_password, user } = await usersApi.create({
        name,
        email,
        role,
        permissions: role === "ADMIN" ? {} : permissions,
      })
      setTempPassword(temporary_password)
      setCreatedEmail(user.email)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError("Já existe um usuário com este e-mail.")
        else if (err.status === 403) setError("Apenas admin pode criar usuários.")
        else setError(err.message)
      } else {
        setError("Falha ao criar usuário.")
      }
      setSubmitting(false)
    }
  }

  function onTempClose() {
    setTempPassword(null)
    setCreatedEmail(null)
    router.push("/admin/users")
  }

  return (
    <>
      <TopBar
        title="Novo usuário"
        subtitle="Felipe Hub · Convidar acesso"
        actions={
          <Button onClick={() => router.push("/admin/users")}>Cancelar</Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-[22px]">
        <form onSubmit={onSubmit} className="max-w-3xl flex flex-col gap-4">
          <div className="bg-card border border-hair rounded-lg p-5">
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-3">
              Identificação
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nome" required>
                <TextInput
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Assistente"
                />
              </FormField>
              <FormField label="E-mail" required hint="Será usado para login.">
                <TextInput
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@empresa.com.br"
                />
              </FormField>
            </div>
            <FormField label="Papel" required>
              <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="ASSISTANT">Assistente (granular)</option>
                <option value="ADMIN">Admin (acesso total)</option>
              </Select>
            </FormField>
          </div>

          {role === "ASSISTANT" && (
            <div className="bg-card border border-hair rounded-lg p-5">
              <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-1">
                Permissões
              </div>
              <div className="text-[11.5px] text-ink-3 mb-3">
                Marque o que este usuário poderá fazer. Você pode ajustar depois
                a qualquer momento.
              </div>
              <PermissionsEditor value={permissions} onChange={setPermissions} />
            </div>
          )}

          {error && (
            <div className="text-[12px] text-err bg-err/10 border border-err/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={() => router.push("/admin/users")}>Cancelar</Button>
            <button
              type="submit"
              disabled={submitting || !name || !email}
              className="inline-flex items-center gap-1.5 bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Criando…" : "Criar e gerar senha"}
            </button>
          </div>
        </form>
      </div>

      <TemporaryPasswordModal
        open={tempPassword !== null}
        password={tempPassword}
        email={createdEmail ?? undefined}
        onClose={onTempClose}
      />
    </>
  )
}
