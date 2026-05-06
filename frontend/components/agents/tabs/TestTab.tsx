"use client"
import { useEffect, useRef, useState } from "react"
import { RotateCcw, Send, Sparkles } from "lucide-react"
import {
  type Agent,
  createConversation,
  deleteConversation,
} from "@/lib/agents-api"
import { sendMessageStream } from "@/lib/agents-sse"
import { AgentAvatar } from "@/components/agents/AgentAvatar"

type ChatMsg = {
  role: "user" | "assistant"
  content: string
  pending?: boolean
}

export function TestTab({ agent }: { agent: Agent }) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const abortRef    = useRef<AbortController | null>(null)

  // Auto-scroll quando chegam novos chunks
  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Cleanup ao desmontar
  useEffect(() => () => abortRef.current?.abort(), [])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming) return

    setError(null)
    setInput("")
    setStreaming(true)

    let convId = conversationId
    if (!convId) {
      try {
        const conv = await createConversation(agent.id, "Teste rápido")
        convId = conv.id
        setConversationId(convId)
      } catch (e) {
        setError("Não foi possível iniciar a conversa: " + (e as Error).message)
        setStreaming(false)
        return
      }
    }

    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "", pending: true }])

    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      await sendMessageStream(convId, text, {
        signal: ctrl.signal,
        onChunk: (chunk) => {
          if (chunk.type === "delta") {
            setMessages((m) => {
              const next = [...m]
              const last = next[next.length - 1]
              if (last?.role === "assistant") {
                next[next.length - 1] = { ...last, content: last.content + chunk.content }
              }
              return next
            })
          } else if (chunk.type === "done") {
            setMessages((m) => {
              const next = [...m]
              const last = next[next.length - 1]
              if (last?.role === "assistant") next[next.length - 1] = { ...last, pending: false }
              return next
            })
          } else if (chunk.type === "error") {
            setError(chunk.content ?? "Erro no streaming")
          }
        },
      })
    } catch (e) {
      setError("Falha no streaming: " + (e as Error).message)
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  async function handleClear() {
    abortRef.current?.abort()
    if (conversationId) {
      // best effort — não bloqueia se falhar
      deleteConversation(conversationId).catch(() => undefined)
    }
    setConversationId(null)
    setMessages([])
    setInput("")
    setError(null)
    setStreaming(false)
  }

  function suggestInitial() {
    setInput("Olá, se apresenta?")
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mensagens */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="bg-bg-surface border border-default rounded-xl py-12 px-6 text-center">
              <div className="text-text-tertiary mx-auto inline-block">
                <Sparkles size={40} strokeWidth={1.5} />
              </div>
              <div className="text-subtitle text-text-primary mt-3">Calibre o agente conversando</div>
              <p className="text-body text-text-secondary mt-1 max-w-md mx-auto">
                Esse chat é só pra teste — não persiste entre sessões.
              </p>
              <button
                onClick={suggestInitial}
                className="mt-comfortable inline-flex items-center gap-2 bg-bg-surface text-text-primary border border-default rounded-default px-3 py-2 text-small font-medium hover:bg-bg-subtle hover:border-strong transition"
              >
                Sugerir mensagem inicial
              </button>
            </div>
          ) : (
            messages.map((m, i) => <Bubble key={i} msg={m} agent={agent} />)
          )}
          {error && (
            <div className="bg-danger-subtle border border-default rounded-md p-3 text-small text-danger">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input fixo */}
      <div className="border-t border-default bg-bg-surface px-6 md:px-8 py-3 shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={messages.length === 0 && !streaming}
            title="Limpar conversa"
            className="text-text-secondary hover:text-text-primary p-2 rounded-default hover:bg-bg-subtle transition disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pergunte algo ao agente…"
            disabled={streaming}
            className="flex-1 bg-bg-surface border border-default rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition resize-none max-h-32 disabled:opacity-50"
            style={{ minHeight: "40px" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition disabled:opacity-50"
          >
            <Send size={14} strokeWidth={1.5} />
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

function Bubble({ msg, agent }: { msg: ChatMsg; agent: Agent }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-brand text-white rounded-xl rounded-tr-sm px-4 py-2.5 text-body whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3">
      <AgentAvatar name={agent.name} size={32} />
      <div className="flex-1 min-w-0">
        <div className="text-tiny text-text-tertiary mb-1">{agent.name}</div>
        <div className="bg-bg-surface border border-default rounded-xl rounded-tl-sm px-4 py-2.5 text-body text-text-primary whitespace-pre-wrap">
          {msg.content}
          {msg.pending && <span className="inline-block w-2 h-4 ml-1 bg-text-tertiary animate-pulse" />}
        </div>
      </div>
    </div>
  )
}
