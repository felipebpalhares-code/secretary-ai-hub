"use client"
/**
 * Sprint H — editar usuário (admin-only).
 *
 * Permite alterar nome, role, permissions e is_active. E-mail não muda
 * (pra trocar e-mail, deletar e recriar).
 */
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

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
  type UserResponse,
  type UserRole,
} from "@/lib/auth-api"
import { ApiError } from "@/lib/api"

export default function EditUserPage() {
  return (
    <AdminOnlyPage>
      <EditUserForm />
    </AdminOnlyPage>
  )
}

function EditUserForm() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params?.id)

  const [user, setUser] = useState<UserResponse | null>(null)
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole>("ASSISTANT")
  const [isActive, setIsActive] = useState(true)
  const [permissions, setPermissions] = useState<PermissionMap>(emptyPermissions())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true
    usersApi
      .list()
      .then((list) => {
        if (!mounted) return
        const u = list.find((x) => x.id === id) ?? null
        setUser(u)
        if (u) {
          setName(u.name)
          setRole(u.role)
          setIsActive(u.is_active)
          setPermissions({ ...emptyPermissions(), ...(u.permissions ?? {}) })
        }
      })
      .catch(() => mounted && setError("Falha ao carregar usuário."))
    return () => {
      mounted = false
    }
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await usersApi.update(id, {
        name,
        role,
        is_active: isActive,
        permissions: role === "ADMIN" ? {} : permissions,
      })
      router.push("/admin/users")
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400) setError(err.message)
        else if (err.status === 403) setError("Apenas admin pode editar usuários.")
        else setError(err.message)
      } else {
        setError("Falha ao salvar.")
      }
      setSubmitting(false)
    }
  }

  async function onResetPassword() {
    if (!confirm("Resetar senha? Uma nova senha temporária será gerada.")) return
    try {
      const { temporary_password } = await usersApi.resetPassword(id)
      setResetPassword(temporary_password)
    } catch {
      alert("Falha ao resetar senha.")
    }
  }

  if (!user && !error) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-3 text-[12px]">
        Carregando…
      </div>
    )
  }

  if (error && !user) {
    return (
      <>
        <TopBar title="Editar usuário" subtitle="Felipe Hub · Gestão" />
        <div className="flex-1 flex items-center justify-center text-err text-[12px]">
          {error}
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title={`Editar · ${user?.name ?? ""}`}
        subtitle={user?.email}
        actions={
          <>
            <Button onClick={() => router.push("/admin/users")}>Cancelar</Button>
            <Button onClick={onResetPassword}>Resetar senha</Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-[22px]">
        <form onSubmit={onSubmit} className="max-w-3xl flex flex-col gap-4">
          <div className="bg-card border border-hair rounded-lg p-5">
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-3">
              Identificação
            </div>
            <FormField label="Nome" required>
              <TextInput
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>
            <FormField label="E-mail" hint="Não pode ser alterado.">
              <TextInput value={user?.email ?? ""} disabled />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Papel">
                <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                  <option value="ASSISTANT">Assistente</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </FormField>
              <FormField label="Status">
                <Select
                  value={isActive ? "1" : "0"}
                  onChange={(e) => setIsActive(e.target.value === "1")}
                >
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Select>
              </FormField>
            </div>
          </div>

          {role === "ASSISTANT" && (
            <div className="bg-card border border-hair rounded-lg p-5">
              <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-3">
                Permissões
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
              disabled={submitting}
              className="inline-flex items-center gap-1.5 bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      <TemporaryPasswordModal
        open={resetPassword !== null}
        password={resetPassword}
        email={user?.email}
        onClose={() => setResetPassword(null)}
      />
    </>
  )
}
