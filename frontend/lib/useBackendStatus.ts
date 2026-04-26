"use client"
import { useEffect, useState } from "react"
import { isBackendUp } from "./api"

export type BackendStatus = "checking" | "online" | "offline"

/** Polls /health a cada N segundos. Retorna status pra mostrar badges/fallbacks. */
export function useBackendStatus(intervalMs = 15000) {
  const [status, setStatus] = useState<BackendStatus>("checking")

  useEffect(() => {
    let mounted = true

    const check = async () => {
      try {
        const ok = await isBackendUp()
        if (mounted) setStatus(ok ? "online" : "offline")
      } catch {
        if (mounted) setStatus("offline")
      }
    }

    check()
    const t = setInterval(check, intervalMs)
    return () => {
      mounted = false
      clearInterval(t)
    }
  }, [intervalMs])

  return status
}
