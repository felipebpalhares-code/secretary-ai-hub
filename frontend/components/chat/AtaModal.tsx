"use client"
import { Icon } from "../Icon"

export function AtaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-5">
      <div className="bg-card rounded-lg w-[580px] max-w-full max-h-[88vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,.2)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hair">
          <div className="text-[14px] font-bold text-ink tracking-[-.2px]">Ata · Briefing 24/04/2026</div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 rounded">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto text-[12.5px] leading-[1.65] text-ink-2">
          <h2 className="text-[14px] font-bold text-ink mb-px tracking-[-.2px]">
            Briefing Diário · Felipe Hub
          </h2>
          <div className="text-[11px] text-ink-3 mb-4 font-medium">
            Data: 24/04/2026 · 07:00 às 08:40 · 6 participantes
          </div>

          <H>Alertas Críticos</H>
          <Action>Processo 0001234 — contestação até 05/05 (12 dias). Ligar para Dr. Carlos Lima hoje.</Action>
          <Action>Proposta Acme — resposta até 18h de hoje. Clara preparando rascunho.</Action>
          <Action>Fatura Nubank + Boleto R$2.400 — vence amanhã 25/04.</Action>

          <H>Pontos Discutidos</H>
          <ul className="list-disc pl-4 space-y-[3px]">
            <li>
              <strong>Jurídico:</strong> prazo em 12 dias, contrato locação vence em 30d
            </li>
            <li>
              <strong>Financeiro:</strong> portfólio R$310k (+1,8%), custas R$1.800 OK
            </li>
            <li>
              <strong>Agenda:</strong> 3 compromissos hoje, aniversário Ana amanhã
            </li>
            <li>
              <strong>E-mails:</strong> 23 não lidos, 3 urgentes priorizados
            </li>
            <li>
              <strong>Obras:</strong> Bloco C 67%, desvio 8%, reunião 14h
            </li>
            <li>
              <strong>Empresas:</strong> lead Acme R$89k, pedido Distribuidora R$85k
            </li>
          </ul>

          <H>Decisões</H>
          <Decision>Felipe aprovará rascunho Clara para Acme antes das 10h</Decision>
          <Decision>Felipe ligará para Dr. Carlos Lima hoje sobre prazo processual</Decision>

          <H>Próximas Ações</H>
          <ul className="list-disc pl-4 space-y-[3px]">
            <li>[ ] Assinar contrato (Clara) — hoje</li>
            <li>[ ] Pagar boleto R$2.400 — amanhã</li>
            <li>[ ] Reunião empreiteiro Bloco C — hoje 14h</li>
            <li>[ ] Definir renovação locação — até 15/11</li>
          </ul>
        </div>
        <div className="flex justify-end gap-[6px] px-5 py-3 border-t border-hair">
          <button
            onClick={onClose}
            className="px-[13px] py-[7px] rounded-md border border-hair bg-card text-[12.5px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors"
          >
            Fechar
          </button>
          <button className="px-[13px] py-[7px] rounded-md border border-hair bg-card text-[12.5px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors">
            Salvar
          </button>
          <button className="px-[13px] py-[7px] rounded-md bg-accent text-white border border-accent text-[12.5px] font-semibold hover:bg-accent-hover transition-colors">
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-ink-3 uppercase tracking-[.06em] mt-[14px] mb-[6px]">
      {children}
    </h3>
  )
}

function Action({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-[8px_12px] mb-[6px] font-semibold text-amber-900">
      {children}
    </div>
  )
}

function Decision({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-[8px_12px] mb-[6px] font-medium text-emerald-800">
      {children}
    </div>
  )
}
