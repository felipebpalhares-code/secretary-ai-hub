"use client"
import { useState, useRef, useEffect } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { AGENT_INFO, type ChatAgent } from "@/lib/chat-data"
import type { WsUpdate, ConnectionState } from "@/lib/useChatSocket"

const COMMANDS = ["/reuniao", "/briefing", "/todos", "/urgente", "/ata", "/resumo", "/fixar", "/exportar"]

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
  onAta,
  onToggleFeed,
  connectionState,
  liveMessages,
  onSend,
}: {
  onAta: () => void
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
  const isLive = connectionState === "open" && (liveMessages?.length ?? 0) + userMessages.length > 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex items-center gap-[10px] px-[18px] py-[14px] bg-card border-b border-hair shrink-0">
        <div className="flex">
          {(["silva", "ricardo", "ana", "clara", "eng", "diretor"] as ChatAgent[]).map((a, i) => (
            <div
              key={a}
              className="w-[26px] h-[26px] rounded-md bg-bg border-[1.5px] border-card flex items-center justify-center text-[13px]"
              style={{ marginLeft: i === 0 ? 0 : -5 }}
            >
              {AGENT_INFO[a].emoji}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-bold text-ink tracking-[-.2px]">
            Briefing Diário · 24/04/2026
          </div>
          <div className="text-[11px] text-ink-3 font-medium mt-px">
            6 agentes · Modo Briefing · 07:00
          </div>
        </div>
        <div className="flex gap-[5px] items-center">
          <span className={cn("inline-flex items-center gap-1 border text-[10.5px] font-semibold px-[9px] py-1 rounded-full", badge.cls)}>
            <span className={cn("w-[6px] h-[6px] rounded-full", badge.dot)} />
            {badge.label}
          </span>
          <span className="inline-flex items-center gap-1 bg-accent-soft border border-indigo-200 text-accent text-[10.5px] font-semibold px-[9px] py-1 rounded-full">
            <Icon name="check" size={11} />
            Perfil carregado
          </span>
          <button
            onClick={onAta}
            className="inline-flex items-center gap-[5px] px-[11px] py-[6px] rounded-md text-[11.5px] font-semibold border border-hair bg-card text-ink hover:bg-bg hover:border-ink-4 transition-colors"
          >
            <Icon name="file" size={12} />
            Ata
          </button>
          <button
            onClick={onToggleFeed}
            className="inline-flex items-center gap-[5px] px-[11px] py-[6px] rounded-md text-[11.5px] font-semibold border border-hair bg-card text-ink hover:bg-bg hover:border-ink-4 transition-colors"
          >
            <Icon name="chart" size={12} />
            Feed
          </button>
        </div>
      </div>

      {/* Cmd bar */}
      <div className="flex gap-[5px] px-4 py-2 bg-card border-t border-hair overflow-x-auto scrollbar-none shrink-0">
        {COMMANDS.map((c) => (
          <button
            key={c}
            className="px-[10px] py-[5px] rounded-md bg-card border border-hair text-[11px] font-semibold text-ink-2 hover:bg-accent-soft hover:border-indigo-200 hover:text-accent transition-colors mono whitespace-nowrap"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-5 py-[18px] flex flex-col gap-[6px]">
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

        {/* Mock briefing (mostra só quando não tem mensagens reais) */}
        {!isLive && (
          <>
        <SysPill variant="briefing">Briefing automático · 07:00 · 24/04/2026</SysPill>
        <A2A>Agentes consultando base de conhecimento...</A2A>

        <AgentMsg agent="silva" time="07:00" urgent>
          <strong>URGENTE — Prazo em 12 dias</strong>
          <br />
          Processo trabalhista <strong>0001234-56.2024</strong> — contestação até{" "}
          <strong>05/05/2026</strong>. Dr. Carlos Lima precisa do seu OK <strong>hoje</strong>.
          <br />
          <br />
          Também: contrato de locação PalharesTech vence em <strong>30 dias</strong>. Renovar ou rescindir?
        </AgentMsg>

        <AgentMsg agent="ricardo" time="07:00">
          Fatura Nubank vence <strong>amanhã</strong> (R$ 3.240). Boleto R$ 2.400 também vence amanhã.
          <br />
          <br />
          CDB Nubank rendeu <strong>R$ 312</strong> no mês. Portfólio total: <strong>R$ 310.000</strong> (+1,8%).
          <br />
          <br />
          Custas processuais estimadas para o trabalhista: R$ 1.800 — verba disponível.
        </AgentMsg>

        <AgentMsg agent="ana" time="07:00">
          <strong>Hoje você tem 3 compromissos:</strong>
          <ul className="list-disc pl-4 mt-1 space-y-px">
            <li>13h — Call equipe de produto (Google Meet)</li>
            <li>14h — Reunião empreiteiro Bloco C</li>
            <li>17h — Review semanal (Zoom)</li>
          </ul>
          <strong>Amanhã é aniversário da Ana!</strong> Quer que eu ajude com o presente?
          <br />
          Mateus tem atividade escolar sexta — portfólio de ciências.
        </AgentMsg>

        <AgentMsg agent="clara" time="07:01">
          <strong>23 e-mails não lidos.</strong> Priorizei os 3 urgentes:
          <ul className="list-disc pl-4 mt-1 space-y-px">
            <li>
              <strong>Proposta Acme</strong> — prazo <strong>hoje até 18h</strong>
            </li>
            <li>
              <strong>Contrato p/ assinatura</strong> — jurídico aguardando
            </li>
            <li>
              <strong>Boleto R$2.400</strong> — vence amanhã
            </li>
          </ul>
          Rascunho a resposta para a Acme?
        </AgentMsg>

        <AgentMsg agent="eng" time="07:01">
          <strong>Bloco C — Vimar:</strong> 67% concluído, <strong>8% acima do orçado</strong>
          <br />
          Reunião com empreiteiro hoje às <strong>14h</strong> (confirmada). Vou levar planilha de desvio.
          <br />
          <br />
          Bloco A 100% concluído · Bloco B aguardando vistoria CREA.
        </AgentMsg>

        <AgentMsg agent="diretor" time="07:02">
          <strong>PalharesTech:</strong> 2 leads novos (R$ 180k combinado). Proposta Acme é um deles —{" "}
          <strong>não perca o prazo das 18h</strong>.
          <br />
          <br />
          <strong>Distribuidora Braz:</strong> pedido R$ 85k aguardando sua aprovação. CD SP: terreno
          identificado.
        </AgentMsg>

        <SysPill>Felipe respondeu às 08:32</SysPill>

        <UserMsg>
          Dr. Silva — ligo pro Dr. Carlos Lima agora. Clara — me mostra o rascunho para a Acme, quero
          fechar antes das 10h. Ana, sim, me ajuda com o presente!
        </UserMsg>

        <A2A>Dr. Silva → Ana: bloquear 3 dias em 01/05 · Clara preparando rascunho...</A2A>

        <AgentMsg agent="clara" time="08:33">
          Rascunho para a Acme:
          <br />
          <br />
          <em className="text-ink-2">
            "Prezado João, obrigado pelo interesse. Temos prazer em apresentar nossa proposta técnica para
            o projeto XYZ. Conforme alinhado, segue em anexo nosso orçamento no valor de R$ 89.000 com
            início em 15/05. Aguardamos sua confirmação. Att, Felipe Palhares."
          </em>
          <br />
          <br />
          Ajusto algum trecho antes de enviar?
        </AgentMsg>
          </>
        )}
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
              : "Mensagem... (use /comando para ações · Enter envia)"
          }
          disabled={connectionState !== "open"}
          className="flex-1 bg-bg border border-hair rounded-md px-[13px] py-[9px] text-[12.5px] text-ink outline-none resize-none min-h-[40px] max-h-[120px] leading-[1.5] focus:border-accent focus:bg-card transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          onClick={submit}
          disabled={connectionState !== "open" || !input.trim()}
          className="w-10 h-10 rounded-md bg-accent text-white border-0 flex items-center justify-center hover:bg-accent-hover transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="send" size={16} />
        </button>
      </div>
    </div>
  )
}

function AgentMsg({
  agent,
  time,
  urgent,
  children,
}: {
  agent: ChatAgent
  time: string
  urgent?: boolean
  children: React.ReactNode
}) {
  const info = AGENT_INFO[agent]
  return (
    <div className="flex flex-col gap-[3px] mb-[10px]">
      <div className="flex items-center gap-[7px] mb-[3px]">
        <div className="w-[22px] h-[22px] rounded-md bg-bg border border-hair flex items-center justify-center text-[11px] shrink-0">
          {info.emoji}
        </div>
        <span className={cn("text-[11.5px] font-bold tracking-[-.1px]", info.nameColor)}>{info.name}</span>
        <span className="text-[10px] text-ink-3 ml-auto font-medium">{time}</span>
      </div>
      <div
        className={cn(
          "max-w-[80%] px-[14px] py-[10px] rounded-md text-[12.5px] leading-[1.55] bg-card border border-hair text-ink border-l-[3px]",
          info.color,
          urgent && "bg-red-50 border-red-200"
        )}
      >
        {children}
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

function SysPill({ children, variant }: { children: React.ReactNode; variant?: "briefing" | "default" }) {
  return (
    <div className="text-center my-2">
      <span
        className={cn(
          "inline-flex items-center gap-[5px] border rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-[-.05px]",
          variant === "briefing"
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-hair-2 border-hair text-ink-2"
        )}
      >
        {children}
      </span>
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
