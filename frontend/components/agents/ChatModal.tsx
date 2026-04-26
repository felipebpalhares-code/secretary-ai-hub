"use client"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import type { Agent } from "@/lib/agents-data"

export function ChatModal({
  agent,
  open,
  onClose,
}: {
  agent: Agent | null
  open: boolean
  onClose: () => void
}) {
  if (!open || !agent) return null
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-end justify-center p-5">
      <div className="bg-card rounded-lg w-[660px] max-w-full h-[85vh] flex flex-col shadow-[0_24px_80px_rgba(15,23,42,.2)]">
        <div className="flex items-center gap-[10px] px-[18px] py-[14px] border-b border-hair shrink-0">
          <div className="w-[34px] h-[34px] rounded-md bg-bg border border-hair flex items-center justify-center text-base shrink-0">
            {agent.emoji}
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink tracking-[-.15px]">
              {agent.name} · {agent.title}
            </div>
            <div className="text-[10.5px] text-ok font-semibold">● Online</div>
          </div>
          <button className="ml-auto inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent bg-accent-soft border border-indigo-200 px-[11px] py-[5px] rounded-md hover:bg-indigo-100 transition-colors">
            <Icon name="chart" size={12} />
            Relatório Semanal
          </button>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink p-1 rounded transition-colors"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="bg-accent-soft border border-indigo-200 rounded-md px-[14px] py-2 text-[11px] text-accent font-semibold flex items-center gap-[6px] shrink-0 mx-[18px] mt-1 mb-1 tracking-[-.05px]">
          <Icon name="check" size={13} />
          Contexto: Perfil de Felipe + 12 documentos + 5 instruções
        </div>

        <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-3">
          <MsgRow from="agent" emoji={agent.emoji}>
            Bom dia, Felipe! Tenho <strong>2 alertas importantes</strong>:
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>
                <strong>Proc. 0001234 (Trabalhista)</strong> — prazo em <strong>12 dias</strong>{" "}
                (05/05/2026). Dr. Carlos Lima precisa protocolar a contestação.
              </li>
              <li>
                <strong>Contrato de Locação PalharesTech</strong> — vence em <strong>30 dias</strong>.
                Renovar ou notificar?
              </li>
            </ul>
            Como prefere prosseguir?
          </MsgRow>

          <MsgRow from="user">
            {agent.name}, me explica em linguagem simples o que acontece se perdermos o prazo do
            processo trabalhista.
          </MsgRow>

          <MsgRow from="agent" emoji={agent.emoji}>
            Claro, Felipe. Em termos simples:
            <br />
            <br />
            Se perdermos o prazo (05/05), o juiz pode declarar <strong>revelia</strong> — aceita como
            verdade tudo que o reclamante disse, sem você poder se defender.
            <br />
            <br />
            <strong>Na prática:</strong>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>Condena automaticamente sem análise</li>
              <li>O valor pedido (R$ 45.000) pode ser integralmente concedido</li>
              <li>Muito difícil reverter em recurso</li>
            </ul>
            <strong>Ação necessária:</strong> ligue hoje para o Dr. Carlos Lima e confirme que a
            contestação está sendo preparada. Consulte presencialmente o advogado para decisão final.
          </MsgRow>
        </div>

        <div className="flex gap-[6px] px-[18px] py-3 border-t border-hair shrink-0">
          <input
            placeholder={`Pergunte ao ${agent.name}...`}
            className="flex-1 border border-hair rounded-md px-[13px] py-[9px] text-[12.5px] text-ink outline-none focus:border-accent"
          />
          <button className="bg-accent text-white px-4 py-[9px] rounded-md text-[12.5px] font-semibold hover:bg-accent-hover transition-colors">
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

function MsgRow({
  from,
  emoji,
  children,
}: {
  from: "user" | "agent"
  emoji?: string
  children: React.ReactNode
}) {
  const isUser = from === "user"
  return (
    <div className={cn("flex items-start gap-[10px]", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-[13px] shrink-0",
          isUser
            ? "bg-ink text-white font-bold text-[12px]"
            : "bg-bg border border-hair"
        )}
      >
        {isUser ? "F" : emoji}
      </div>
      <div
        className={cn(
          "max-w-[75%] px-[13px] py-[10px] text-[12.5px] leading-[1.55] rounded-md",
          isUser
            ? "bg-accent text-white"
            : "bg-bg border border-hair text-ink"
        )}
      >
        {children}
      </div>
    </div>
  )
}
