"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { getIdentity, type Identity } from "@/lib/api"

type IdentityState = {
  identity: Identity | null
  loading: boolean
  error: string | null
  isEditOpen: boolean
  openEdit: () => void
  closeEdit: () => void
  setIdentity: (next: Identity) => void
  reload: () => Promise<void>
}

const Ctx = createContext<IdentityState | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentityState] = useState<Identity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setEditOpen] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getIdentity()
      setIdentityState(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar perfil")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return (
    <Ctx.Provider
      value={{
        identity,
        loading,
        error,
        isEditOpen,
        openEdit: () => setEditOpen(true),
        closeEdit: () => setEditOpen(false),
        setIdentity: setIdentityState,
        reload,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useIdentity() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useIdentity precisa estar dentro de IdentityProvider")
  return ctx
}
