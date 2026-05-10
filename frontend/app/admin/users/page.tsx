"use client"
/**
 * Sprint H — lista de usuários (admin-only).
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { TopBar, Button } from "@/components/TopBar"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { AdminOnlyPage } from "@/components/auth/AdminOnlyPage"
import { TemporaryPasswordModal } from "@/components/admin/TemporaryPasswordModal"
import { usersApi, type UserResponse } from "@/lib/auth-api"

export default function AdminUsersPage() {
  return (
    <AdminOnlyPage>
      <UsersList />
    </AdminOnlyPage>
  )
}

function UsersList() {
  const router = useRouter()
  const [users, setUsers] = useState<UserResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<{
    user: UserResponse
    password: string
  } | null>(null)

  async function load() {
    setError(null)
    try {
      const list = await usersApi.list()
      setUsers(list)
    } catch (err) {
      setError("Falha ao carregar usuários.")
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function resetPassword(u: UserResponse) {
    if (!confirm(`Resetar senha de ${u.name}? Uma nova senha temporária será gerada.`)) return
    try {
      const { temporary_password } = await usersApi.resetPassword(u.id)
      setResetTarget({ user: u, password: temporary_password })
      load()
    } catch {
      alert("Falha ao resetar senha.")
    }
  }

  async function toggleActive(u: UserResponse) {
    if (u.is_active) {
      if (!confirm(`Desativar ${u.name}? Ele não poderá mais fazer login.`)) return
      try {
        await usersApi.remove(u.id)
        load()
      } catch (err) {
        alert("Não foi possível desativar (pode ser o último admin).")
      }
    } else {
      try {
        await usersApi.update(u.id, { is_active: true })
        load()
      } catch {
        alert("Falha ao reativar.")
      }
    }
  }

  return (
    <>
      <TopBar
        title="Usuários"
        subtitle="Felipe Hub · Gestão de acesso"
        actions={
          <Button variant="primary" icon="plus" onClick={() => router.push("/admin/users/new")}>
            Novo usuário
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-[22px]">
        {error && (
          <div className="text-[12px] text-err bg-err/10 border border-err/30 rounded-md px-3 py-2 mb-3">
            {error}
          </div>
        )}

        {users === null ? (
          <div className="text-ink-3 text-[12px]">Carregando…</div>
        ) : users.length === 0 ? (
          <EmptyState
            icon="users"
            title="Nenhum usuário cadastrado"
            subtitle="Convide a primeira pessoa a acessar o Felipe Hub."
            action={
              <Button variant="primary" icon="plus" onClick={() => router.push("/admin/users/new")}>
                Novo usuário
              </Button>
            }
          />
        ) : (
          <div className="bg-card border border-hair rounded-lg overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead className="bg-bg border-b border-hair">
                <tr className="text-left text-[10.5px] font-bold text-ink-3 uppercase tracking-[.07em]">
                  <th className="px-4 py-2.5">Nome</th>
                  <th className="px-4 py-2.5">E-mail</th>
                  <th className="px-4 py-2.5">Papel</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Último login</th>
                  <th className="px-4 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-hair hover:bg-bg/60">
                    <td className="px-4 py-2.5 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-2.5 text-ink-2 font-mono text-[11.5px]">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={u.role === "ADMIN" ? "indigo" : "neutral"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      {u.is_active ? (
                        <Badge variant="green">Ativo</Badge>
                      ) : (
                        <Badge variant="gray">Inativo</Badge>
                      )}
                      {u.must_change_password && (
                        <Badge variant="amber" className="ml-1.5">Trocar senha</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-3 text-[11.5px]">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11.5px] text-ink-2 hover:text-ink hover:bg-bg border border-hair"
                          title="Editar"
                        >
                          <Icon name="edit" size={12} /> Editar
                        </Link>
                        <button
                          onClick={() => resetPassword(u)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11.5px] text-ink-2 hover:text-ink hover:bg-bg border border-hair"
                          title="Resetar senha"
                        >
                          <Icon name="lock" size={12} /> Reset
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11.5px] text-ink-2 hover:text-ink hover:bg-bg border border-hair"
                          title={u.is_active ? "Desativar" : "Reativar"}
                        >
                          <Icon name={u.is_active ? "trash" : "check"} size={12} />
                          {u.is_active ? "Desativar" : "Reativar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TemporaryPasswordModal
        open={resetTarget !== null}
        password={resetTarget?.password ?? null}
        email={resetTarget?.user.email}
        onClose={() => setResetTarget(null)}
      />
    </>
  )
}
