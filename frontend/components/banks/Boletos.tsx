"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import {
  BOLETOS_PAGAR,
  BOLETOS_PAGOS,
  BOLETOS_RECEBER,
  ORIGIN_LABEL,
  daysUntil,
  type Boleto,
} from "@/lib/boletos-data"
import { ENTITIES, fmtBRL } from "@/lib/banks-data"

type SubTab = "a-pagar" | "pagos" | "receber"

export function Boletos() {
  const [tab, setTab] = useState<SubTab>("a-pagar")
  const [selectedId, setSelectedId] = useState<string | null>(BOLETOS_PAGAR[0].id)

  const totalPagar = BOLETOS_PAGAR.reduce((s, b) => s + b.amount, 0)
  const venceSemana = BOLETOS_PAGAR.filter((b) => {
    const d = daysUntil(b.dueDate)
    return d >= 0 && d <= 7
  })
  const totalPagos = BOLETOS_PAGOS.reduce((s, b) => s + b.amount, 0)
  const totalReceber = BOLETOS_RECEBER.reduce((s, b) => s + b.amount, 0)

  const list = tab === "a-pagar" ? BOLETOS_PAGAR : tab === "pagos" ? BOLETOS_PAGOS : BOLETOS_RECEBER
  const selected = list.find((b) => b.id === selectedId) ?? list[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Stat
          icon="alert"
          variant="err"
          label="A pagar"
          value={fmtBRL(totalPagar)}
          meta={`${BOLETOS_PAGAR.length} boletos · ${venceSemana.length} esta semana`}
        />
        <Stat
          icon="clock"
          variant="amber"
          label="Vence esta semana"
          value={fmtBRL(venceSemana.reduce((s, b) => s + b.amount, 0))}
          meta={`${venceSemana.length} pendentes`}
        />
        <Stat
          icon="check"
          variant="ok"
          label="Pagos no mês"
          value={fmtBRL(totalPagos)}
          meta={`${BOLETOS_PAGOS.length} pagamentos`}
        />
        <Stat
          icon="send"
          variant="indigo"
          label="A receber"
          value={fmtBRL(totalReceber)}
          meta={`${BOLETOS_RECEBER.length} cobranças emitidas`}
        />
      </div>

      {/* Auto-import banner */}
      <div className="bg-card border border-hair border-l-[3px] border-l-ok rounded-md px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-emerald-50 text-ok border border-emerald-200 flex items-center justify-center">
          <Icon name="bot" size={15} />
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
            OCR automático ativo · WhatsApp, Telegram, e-mail
          </div>
          <div className="text-[11px] text-ink-2 font-medium mt-px">
            Marcos lê código de barras, classifica e agenda. Você confirma com 1 clique.
          </div>
        </div>
        <div className="flex gap-3 text-[11px] text-ink-2 font-medium">
          <div>
            Importados hoje: <strong className="text-ink font-bold">3</strong>
          </div>
          <div>
            Mês: <strong className="text-ink font-bold">23</strong>
          </div>
        </div>
        <button className="px-[13px] py-[7px] rounded-md border border-hair bg-card text-[12px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors flex items-center gap-1">
          <Icon name="plus" size={12} />
          Importar boleto
        </button>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-card border border-hair rounded-md p-[3px] self-start">
        {(
          [
            { id: "a-pagar" as const, label: "A pagar", count: BOLETOS_PAGAR.length, icon: "send" as const },
            { id: "pagos" as const, label: "Pagos", count: BOLETOS_PAGOS.length, icon: "check" as const },
            { id: "receber" as const, label: "A receber", count: BOLETOS_RECEBER.length, icon: "money" as const },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              const newList =
                t.id === "a-pagar"
                  ? BOLETOS_PAGAR
                  : t.id === "pagos"
                    ? BOLETOS_PAGOS
                    : BOLETOS_RECEBER
              setSelectedId(newList[0]?.id ?? null)
            }}
            className={cn(
              "px-[12px] py-[6px] rounded text-[12px] font-semibold flex items-center gap-[5px] transition-colors",
              tab === t.id ? "bg-accent text-white" : "text-ink-2 hover:bg-bg"
            )}
          >
            <Icon name={t.icon} size={12} />
            {t.label}
            <span
              className={cn(
                "text-[10px] font-bold px-[5px] py-px rounded",
                tab === t.id ? "bg-white/20 text-white" : "bg-hair-2 text-ink-3"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-3">
        <BoletoList tab={tab} list={list} selectedId={selected?.id} onSelect={setSelectedId} />
        {selected && <BoletoDetail boleto={selected} tab={tab} />}
      </div>
    </div>
  )
}

function BoletoList({
  tab,
  list,
  selectedId,
  onSelect,
}: {
  tab: SubTab
  list: Boleto[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  // group by month
  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="grid grid-cols-[40px_1fr_120px_140px_44px] px-4 py-2 border-b border-hair bg-bg text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
        <div></div>
        <div>Beneficiário · Descrição</div>
        <div>{tab === "pagos" ? "Pago em" : "Vence em"}</div>
        <div className="text-right">Valor</div>
        <div></div>
      </div>
      {list.map((b, i) => (
        <BoletoRow
          key={b.id}
          boleto={b}
          tab={tab}
          selected={selectedId === b.id}
          onClick={() => onSelect(b.id)}
          last={i === list.length - 1}
        />
      ))}
    </div>
  )
}

function BoletoRow({
  boleto,
  tab,
  selected,
  onClick,
  last,
}: {
  boleto: Boleto
  tab: SubTab
  selected: boolean
  onClick: () => void
  last: boolean
}) {
  const days = daysUntil(boleto.dueDate)
  const origin = ORIGIN_LABEL[boleto.origin]
  const dueLabel =
    tab === "pagos" && boleto.paidDate
      ? formatDateBR(boleto.paidDate)
      : days < 0
        ? `${Math.abs(days)}d atrás`
        : days === 0
          ? "Hoje"
          : days === 1
            ? "Amanhã"
            : `${days} dias`
  const dueCls =
    tab === "pagos"
      ? "text-ink-2"
      : days <= 1
        ? "text-err"
        : days <= 5
          ? "text-warn"
          : "text-ink-2"

  return (
    <div
      onClick={onClick}
      className={cn(
        "grid grid-cols-[40px_1fr_120px_140px_44px] items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
        selected ? "bg-accent-soft" : "hover:bg-bg",
        !last && "border-b border-hair-2"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-md flex items-center justify-center shrink-0 border",
          tab === "pagos"
            ? "bg-emerald-50 text-ok border-emerald-200"
            : days <= 1
              ? "bg-red-50 text-err border-red-200"
              : days <= 5
                ? "bg-amber-50 text-warn border-amber-200"
                : "bg-bg text-ink-2 border-hair"
        )}
      >
        <Icon
          name={tab === "pagos" ? "check" : days <= 1 ? "alert" : "clock"}
          size={14}
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-bold text-ink tracking-[-.15px] truncate">
            {boleto.payee}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-[3px] text-[9.5px] font-bold px-[6px] py-px rounded border whitespace-nowrap",
              boleto.origin === "whatsapp"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : boleto.origin === "auto"
                  ? "bg-accent-soft text-accent border-indigo-200"
                  : "bg-hair-2 text-ink-2 border-hair"
            )}
          >
            <Icon name={origin.icon as any} size={9} />
            {origin.label}
          </span>
          {boleto.ocrConfidence && (
            <span className="text-[9.5px] font-bold text-ok">OCR {boleto.ocrConfidence}%</span>
          )}
        </div>
        <div className="text-[11px] text-ink-3 font-medium mt-px truncate">
          {boleto.desc}
          {boleto.meta && <span className="text-ink-3"> · {boleto.meta}</span>}
        </div>
      </div>

      <div>
        <div className={cn("text-[12.5px] font-bold mono tabular tracking-[-.1px]", dueCls)}>
          {dueLabel}
        </div>
        <div className="text-[10.5px] text-ink-3 font-medium mono">
          {formatDateBR(tab === "pagos" ? boleto.paidDate ?? boleto.dueDate : boleto.dueDate)}
        </div>
      </div>

      <div className="text-right">
        <div className="text-[14px] font-bold text-ink mono tabular tracking-[-.2px]">
          {fmtBRL(boleto.amount)}
        </div>
        <div className="text-[10px] text-ink-3 font-medium mt-px">{boleto.category}</div>
      </div>

      <div className="flex justify-end">
        <Icon name="chevron" size={13} className="text-ink-4" />
      </div>
    </div>
  )
}

function BoletoDetail({ boleto, tab }: { boleto: Boleto; tab: SubTab }) {
  const entity = ENTITIES.find((e) => e.id === boleto.entity)!
  const days = daysUntil(boleto.dueDate)
  const origin = ORIGIN_LABEL[boleto.origin]

  return (
    <div className="bg-card border border-hair rounded-lg flex flex-col h-fit sticky top-4 overflow-hidden">
      <div className="px-5 py-4 border-b border-hair">
        <div className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] mb-1">
          {tab === "pagos" ? "Comprovante" : tab === "receber" ? "Cobrança emitida" : "Detalhes do boleto"}
        </div>
        <div className="text-[15px] font-bold text-ink tracking-[-.25px] leading-[1.3]">
          {boleto.payee}
        </div>
        <div className="text-[12px] text-ink-2 mt-1 font-medium">{boleto.desc}</div>
        {boleto.meta && (
          <div className="text-[11px] text-ink-3 font-medium mt-px">{boleto.meta}</div>
        )}
      </div>

      <div className="px-5 py-4 border-b border-hair">
        <div className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] mb-1">
          {tab === "pagos" ? "Valor pago" : "Valor"}
        </div>
        <div className="text-[28px] font-bold text-ink mono tabular tracking-[-.5px] leading-none">
          {fmtBRL(boleto.amount)}
        </div>
        {tab === "pagos" && boleto.paidDate && (
          <div className="text-[11.5px] text-ok font-bold mt-2 flex items-center gap-1">
            <Icon name="check" size={12} />
            Pago em {formatDateBR(boleto.paidDate)}
          </div>
        )}
        {tab === "a-pagar" && (
          <div
            className={cn(
              "text-[11.5px] font-bold mt-2",
              days <= 1 ? "text-err" : days <= 5 ? "text-warn" : "text-ink-2"
            )}
          >
            {days < 0
              ? `Atrasado há ${Math.abs(days)} dias`
              : days === 0
                ? "Vence hoje"
                : days === 1
                  ? "Vence amanhã"
                  : `Vence em ${days} dias · ${formatDateBR(boleto.dueDate)}`}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-b border-hair flex flex-col gap-2 text-[12px]">
        <DetailRow label="Origem">
          <span className="inline-flex items-center gap-[5px] font-semibold">
            <Icon name={origin.icon as any} size={11} className="text-ink-3" />
            {origin.label}
            {boleto.ocrConfidence && (
              <span className="text-[9.5px] font-bold text-ok bg-emerald-50 border border-emerald-200 px-[5px] py-px rounded">
                OCR {boleto.ocrConfidence}%
              </span>
            )}
          </span>
        </DetailRow>
        <DetailRow label="Categoria">{boleto.category}</DetailRow>
        <DetailRow label="Entidade">{entity.short}</DetailRow>
        <DetailRow label="Anexos">
          {boleto.attachments} {boleto.attachments === 1 ? "documento" : "documentos"}
        </DetailRow>
        {boleto.digitableLine && (
          <DetailRow label="Linha digitável">
            <span className="mono text-[10px] text-ink-3 break-all">{boleto.digitableLine}</span>
          </DetailRow>
        )}
      </div>

      {boleto.agentSuggestion && (
        <div className="px-5 py-3 bg-accent-soft/50 border-b border-hair">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-md bg-accent text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              R
            </div>
            <div className="text-[11.5px] text-accent font-medium leading-[1.5]">
              {boleto.agentSuggestion}
            </div>
          </div>
        </div>
      )}

      {tab === "a-pagar" && (
        <div className="px-5 py-3 flex flex-col gap-2">
          <button className="px-3 py-[10px] rounded-md bg-accent text-white border border-accent text-[12.5px] font-semibold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
            <Icon name="send" size={13} />
            Pagar agora
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-2 py-[8px] rounded-md bg-card border border-hair text-ink text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center gap-1">
              <Icon name="calendar" size={11} />
              Agendar
            </button>
            <button className="px-2 py-[8px] rounded-md bg-card border border-hair text-ink text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center gap-1">
              <Icon name="check" size={11} />
              Marcar pago
            </button>
          </div>
          <button className="px-2 py-[8px] rounded-md bg-card border border-hair text-ink-2 text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center gap-1">
            <Icon name="file" size={11} />
            Ver PDF original
          </button>
        </div>
      )}

      {tab === "pagos" && (
        <div className="px-5 py-3 flex flex-col gap-2">
          <button className="px-3 py-[8px] rounded-md bg-card border border-hair text-ink text-[12px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center gap-1">
            <Icon name="file" size={12} />
            Comprovante
          </button>
        </div>
      )}

      {tab === "receber" && (
        <div className="px-5 py-3 flex flex-col gap-2">
          <button className="px-3 py-[10px] rounded-md bg-accent text-white border border-accent text-[12.5px] font-semibold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
            <Icon name="send" size={13} />
            Reenviar para cliente
          </button>
          <button className="px-3 py-[8px] rounded-md bg-card border border-hair text-ink text-[12px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center gap-1">
            <Icon name="check" size={12} />
            Marcar como recebido
          </button>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-ink-3 text-[10.5px] w-[88px] shrink-0 font-medium pt-0.5">{label}</span>
      <span className="font-semibold text-ink flex-1 break-words">{children}</span>
    </div>
  )
}

function Stat({
  icon,
  variant,
  label,
  value,
  meta,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  variant: "indigo" | "ok" | "err" | "amber"
  label: string
  value: string
  meta: string
}) {
  const cls = {
    indigo: "border-l-accent",
    ok: "border-l-ok",
    err: "border-l-err",
    amber: "border-l-warn",
  }[variant]
  const iconBg = {
    indigo: "bg-accent-soft text-accent border-indigo-200",
    ok: "bg-emerald-50 text-ok border-emerald-200",
    err: "bg-red-50 text-err border-red-200",
    amber: "bg-amber-50 text-warn border-amber-200",
  }[variant]
  return (
    <div className={cn("bg-card border border-hair border-l-[3px] rounded-md p-4", cls)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-7 h-7 rounded-md border flex items-center justify-center", iconBg)}>
          <Icon name={icon} size={13} />
        </div>
        <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">{label}</span>
      </div>
      <div className="text-[18px] font-bold text-ink mono tabular tracking-[-.3px]">{value}</div>
      <div className="text-[10.5px] text-ink-3 font-medium mt-1">{meta}</div>
    </div>
  )
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}
