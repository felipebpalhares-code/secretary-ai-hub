"use client"
import { useEffect, useRef, useState, useCallback } from "react"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"

export type WsUpdate =
  | { type: "status"; agent?: string; agentName?: string; color?: string; message?: string }
  | { type: "message"; agent?: string; agentName?: string; color?: string; content: string }
  | { type: "error"; content: string }

export type ConnectionState = "connecting" | "open" | "closed" | "error"

/**
 * WebSocket hook que conecta ao FastAPI em /ws.
 * O orchestrator emite { type: "status" | "message" } conforme processa cada agente.
 */
export function useChatSocket(onUpdate: (msg: WsUpdate) => void) {
  const [state, setState] = useState<ConnectionState>("connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    let mounted = true
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      if (!mounted) return
      try {
        const ws = new WebSocket(`${WS_URL}/ws`)
        wsRef.current = ws

        ws.onopen = () => mounted && setState("open")
        ws.onclose = () => {
          if (!mounted) return
          setState("closed")
          retryTimer = setTimeout(connect, 3000)
        }
        ws.onerror = () => mounted && setState("error")
        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data) as WsUpdate
            onUpdateRef.current(data)
          } catch {}
        }
      } catch {
        setState("error")
        retryTimer = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      mounted = false
      if (retryTimer) clearTimeout(retryTimer)
      wsRef.current?.close()
    }
  }, [])

  const send = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }))
      return true
    }
    return false
  }, [])

  return { state, send }
}
