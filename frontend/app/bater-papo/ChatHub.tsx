"use client"
import { useCallback, useState } from "react"
import { Icon } from "@/components/Icon"
import { ChatMain } from "@/components/chat/ChatMain"
import { useChatSocket, type WsUpdate } from "@/lib/useChatSocket"

/**
 * ChatHub:
 * - Coluna central: ChatMain (chat real via WebSocket /ws com o orquestrador).
 *   Funciona enquanto o backend tiver pelo menos uma chave LLM válida.
 * - Coluna esquerda: lista de conversas — empty (sem persistência de histórico ainda).
 * - Coluna direita: feed agente-pra-agente — empty (sem persistência ainda).
 *
 * Quando histórico de conversas e feed A2A virarem APIs reais, substituir as
 * sidebars empty por fetches.
 */
export function ChatHub() {
  const [feedOpen, setFeedOpen] = useState(false)
  const [liveMessages, setLiveMessages] = useState<WsUpdate[]>([])

  const handleUpdate = useCallback((u: WsUpdate) => {
    setLiveMessages((prev) => {
      if (u.type === "message" || u.type === "status") {
        return [...prev.filter((m) => m.type !== "status"), u]
      }
      return [...prev, u]
    })
  }, [])

  const { state, send } = useChatSocket(handleUpdate)

  const sendMessage = (content: string) => {
    send(content)
  }

  return (
    <div className="flex-1 flex overflow-hidden min-w-0 bg-bg-app">
      {/* Sidebar de conversas — sem persistência ainda */}
      <aside className="w-[262px] min-w-[262px] bg-bg-surface border-r border-default flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-default flex items-center justify-between">
          <div className="text-body-strong text-text-primary">Conversas</div>
          <button
            type="button"
            disabled
            title="Histórico de conversas virá numa próxima entrega"
            className="text-text-tertiary cursor-not-allowed"
            aria-label="Nova conversa"
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-text-tertiary mb-3">
              <Icon name="chat" size={32} strokeWidth={1.5} />
            </div>
            <div className="text-small text-text-secondary leading-relaxed max-w-[200px]">
              Sem conversas salvas. Comece a falar com um agente no painel ao lado.
            </div>
          </div>
        </div>
      </aside>

      {/* Chat real (WebSocket) */}
      <ChatMain
        onAta={() => undefined}
        onToggleFeed={() => setFeedOpen((f) => !f)}
        connectionState={state}
        liveMessages={liveMessages}
        onSend={sendMessage}
      />

      {/* Feed lateral — sem persistência de A2A ainda */}
      {feedOpen && (
        <aside className="w-[300px] min-w-[300px] bg-bg-surface border-l border-default flex flex-col shrink-0">
          <div className="px-4 py-4 border-b border-default flex items-center justify-between">
            <div className="text-body-strong text-text-primary">Feed dos agentes</div>
            <button
              onClick={() => setFeedOpen(false)}
              className="text-text-tertiary hover:text-text-primary p-1 rounded"
              aria-label="Fechar feed"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="text-text-tertiary mb-3">
                <Icon name="bot" size={32} strokeWidth={1.5} />
              </div>
              <div className="text-small text-text-secondary leading-relaxed max-w-[220px]">
                Sem atividade recente entre agentes. Quando o sistema A2A persistir
                eventos, eles aparecem aqui.
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
