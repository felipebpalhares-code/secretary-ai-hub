"use client"
import { useCallback, useEffect, useState } from "react"
import { banksConnectToken, banksSync } from "./api"

const PLUGGY_SCRIPT_URL = "https://cdn.pluggy.ai/web-connect/v3/index.js"

declare global {
  interface Window {
    PluggyConnect?: any
  }
}

export type PluggyItem = { id: string; status: string; connector: { name: string; imageUrl: string } }

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"))
  if (window.PluggyConnect) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = PLUGGY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error("Falha carregando Pluggy Connect"))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

type Options = {
  onSuccess?: (item: PluggyItem) => void
  onError?: (err: unknown) => void
  onClose?: () => void
  /** itemId para reconectar conta existente (refresh credentials) */
  itemId?: string
  /** se inclui sandbox / banks de teste */
  includeSandbox?: boolean
}

export function usePluggyConnect() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = useCallback(async (opts: Options = {}) => {
    setError(null)
    setLoading(true)
    try {
      // 1. carregar SDK
      await loadScript()
      const { PluggyConnect } = window
      if (!PluggyConnect) throw new Error("Pluggy Connect SDK não disponível")

      // 2. obter connect token do backend
      const { accessToken } = await banksConnectToken(opts.itemId)
      if (!accessToken) throw new Error("Backend não retornou accessToken")

      // 3. abrir widget
      const widget = new PluggyConnect({
        connectToken: accessToken,
        includeSandbox: opts.includeSandbox ?? true,
        onSuccess: async (itemData: { item: PluggyItem }) => {
          // após pareamento, sincroniza no nosso DB
          try {
            await banksSync()
          } catch (e) {
            console.warn("Falha ao sincronizar após connect:", e)
          }
          opts.onSuccess?.(itemData.item)
        },
        onError: (err: unknown) => {
          setError(String(err))
          opts.onError?.(err)
        },
        onClose: () => opts.onClose?.(),
      })
      widget.init()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido"
      setError(msg)
      opts.onError?.(e)
    } finally {
      setLoading(false)
    }
  }, [])

  return { open, loading, error }
}
