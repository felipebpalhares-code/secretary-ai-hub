"use client"
import { useState, useRef, useEffect } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import type { WsUpdate, ConnectionState } from "@/lib/useChatSocket"
import { PermissionGate } from "@/components/auth/PermissionGate"

const STATE_BADGE: Record<ConnectionState, { label: string; cls: string; dot: string }> = {
  connecting: {
    label: "Conectando",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-warn animate-pulse",
  },
  open: {
    label: "Online",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-ok",
  },
  closed: {
    label: "Reconectando",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-warn animate-pulse",
  },
  error: {
    label: "Backend offline",
    cls: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-err",
  },
}

export function ChatMain({
  onToggleFeed,
  connectionState,
  liveMessages,
  onSend,
}: {
  onAta?: () => void
  onToggleFeed: () => void
  connectionState?: ConnectionState
  liveMessages?: WsUpdate[]
  onSend?: (content: string) => void
}) {
  const [input, setInput] = useState("")
  const [userMessages, setUserMessages] = useState<{ text: string; time: string }[]>([])
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" })
  }, [liveMessages, userMessages])

  const submit = () => {
    const text = input.trim()
    if (!text || !onSend) return
    onSend(text)
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    setUserMessages((m) => [...m, { text, time }])
    setInput("")
  }

  const badge = connectionState ? STATE_BADGE[connectionState] : STATE_BADGE.connecting
  const hasMessages = (liveMessages?.length ?? 0) + userMessages.length > 0
  const lastAgentName = [...(liveMessages ?? [])]
    .reverse()
    .find((m): m is Extract<WsUpdate, { type: "message" }> => m.type === "message")
    ?.agentName

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex items-center gap-[10px] px-[18px] py-[14px] bg-card border-b border-hair shrink-0">
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-bold text-ink tracking-[-.2px]">
            {lastAgentName ?? "Chat com agentes"}
          </div>
          <div className="text-[11px] text-ink-3 font-medium mt-px">
            {hasMessages ? "Conversa ativa" : "Envie uma mensagem para começar"}
          </div>
        </div>
        <div className="flex gap-[5px] items-center">
          <span className={cn("inline-flex items-center gap-1 border text-[10.5px] font-semibold px-[9px] py-1 rounded-full", badge.cls)}>
            <span className={cn("w-[6px] h-[6px] rounded-full", badge.dot)} />
            {badge.label}
          </span>
          <button
            onClick={onToggleFeed}
            className="inline-flex items-center gap-[5px] px-[11px] py-[6px] rounded-md text-[11.5px] font-semibold border border-hair bg-card text-ink hover:bg-bg hover:border-ink-4 transition-colors"
          >
            <Icon name="chart" size={12} />
            Feed
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-5 py-[18px] flex flex-col gap-[6px]">
        {!hasMessages && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-[280px]">
              <div className="text-text-tertiary mb-3 flex justify-center">
                <Icon name="chat" size={32} strokeWidth={1.5} />
              </div>
              <div className="text-small text-text-secondary leading-relaxed">
                {connectionState === "error"
                  ? "Backend offline. Inicie o servidor para conversar."
                  : "Selecione uma conversa ou comece uma nova mandando uma mensagem abaixo."}
              </div>
            </div>
          </div>
        )}

        {/* Live messages do backend WebSocket */}
        {liveMessages?.map((msg, i) => {
          if (msg.type === "status") {
            return (
              <A2A key={`live-${i}`}>
                {msg.message ?? "Processando..."}
              </A2A>
            )
          }
          if (msg.type === "message") {
            return (
              <div key={`live-${i}`} className="flex flex-col gap-[3px] mb-[10px]">
                <div className="flex items-center gap-[7px] mb-[3px]">
                  <div className="w-[22px] h-[22px] rounded-md bg-bg border border-hair flex items-center justify-center text-[11px] shrink-0">
                    🤖
                  </div>
                  <span className="text-[11.5px] font-bold tracking-[-.1px] text-accent">
                    {msg.agentName ?? "Agente"}
                  </span>
                  <span className="text-[10px] text-ink-3 ml-auto font-medium">agora</span>
                </div>
                <div className="max-w-[80%] px-[14px] py-[10px] rounded-md text-[12.5px] leading-[1.55] bg-card border border-hair text-ink border-l-[3px] border-l-accent whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            )
          }
          if (msg.type === "error") {
            return (
              <div
                key={`live-${i}`}
                className="bg-red-50 border border-red-200 text-err rounded-md px-3 py-2 text-[12px] font-semibold"
              >
                ⚠️ {msg.content}
              </div>
            )
          }
          return null
        })}

        {/* User messages live */}
        {userMessages.map((m, i) => (
          <UserMsg key={`user-${i}`}>{m.text}</UserMsg>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-[6px] items-end px-4 py-3 bg-card border-t border-hair shrink-0">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={
            connectionState === "error"
              ? "Backend offline · inicie uvicorn pra mandar mensagem"
              : "Mensagem... (Enter envia · Shift+Enter quebra linha)"
          }
          disabled={connectionState !== "open"}
          className="flex-1 bg-bg border border-hair rounded-md px-[13px] py-[9px] text-[12.5px] text-ink outline-none resize-none min-h-[40px] max-h-[120px] leading-[1.5] focus:border-accent focus:bg-card transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <PermissionGate module="whatsapp" action="enviar">
          <button
            onClick={submit}
            disabled={connectionState !== "open" || !input.trim()}
            className="w-10 h-10 rounded-md bg-accent text-white border-0 flex items-center justify-center hover:bg-accent-hover transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="send" size={16} />
          </button>
        </PermissionGate>
      </div>
    </div>
  )
}

function UserMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end mb-3 gap-2 items-end">
      <div className="max-w-[70%] bg-accent text-white px-[14px] py-[10px] rounded-md text-[12.5px] leading-[1.55]">
        {children}
      </div>
      <div className="w-[26px] h-[26px] rounded-full bg-ink text-white flex items-center justify-center text-xs font-bold shrink-0">
        F
      </div>
    </div>
  )
}

function A2A({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-[7px] px-[11px] py-[6px] bg-accent-soft border border-indigo-200 rounded-md text-[10.5px] text-accent font-semibold my-1 self-start tracking-[-.05px]">
      <span className="w-[5px] h-[5px] rounded-full bg-accent" />
      {children}
    </div>
  )
}
