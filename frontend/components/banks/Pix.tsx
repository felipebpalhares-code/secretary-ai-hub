"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import {
  PIX_FAVORITES,
  PIX_HISTORY,
  PIX_SCHEDULED,
  PIX_KEYS,
  KEY_LABEL,
  type PixFavorite,
  type PixTx,
} from "@/lib/pix-data"
import { fmtBRL, BANK_COLORS } from "@/lib/banks-data"

const TONE_AV = {
  indigo: "bg-accent text-white",
  ok: "bg-ok text-white",
  warn: "bg-warn text-white",
  amber: "bg-amber-500 text-white",
  pink: "bg-pink-500 text-white",
  purple: "bg-purple-600 text-white",
  slate: "bg-slate-600 text-white",
}

const CATEGORY_LABEL = {
  familia: "Família",
  fornecedor: "Fornecedor",
  funcionario: "Funcionário",
  cliente: "Cliente",
  pessoal: "Pessoal",
  agente: "Agente",
}

const CATEGORY_CLS = {
  familia: "bg-pink-50 text-pink-700 border-pink-200",
  fornecedor: "bg-amber-50 text-amber-700 border-amber-200",
  funcionario: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cliente: "bg-blue-50 text-blue-700 border-blue-200",
  pessoal: "bg-accent-soft text-accent border-indigo-200",
  agente: "bg-purple-50 text-purple-700 border-purple-200",
}

export function Pix() {
  const [tab, setTab] = useState<"enviar" | "historico" | "agendados" | "minhas-chaves">("enviar")
  const [filterCat, setFilterCat] = useState<string>("all")

  const totalSentMonth = PIX_HISTORY.filter((p) => p.type === "out").reduce((s, p) => s + p.amount, 0)
  const totalReceivedMonth = PIX_HISTORY.filter((p) => p.type === "in").reduce((s, p) => s + p.amount, 0)
  const scheduledTotal = PIX_SCHEDULED.reduce((s, p) => s + p.amount, 0)

  const filteredFavorites =
    filterCat === "all" ? PIX_FAVORITES : PIX_FAVORITES.filter((f) => f.category === filterCat)

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Stat
          icon="send"
          variant="err"
          label="PIX enviado"
          value={fmtBRL(totalSentMonth)}
          meta={`${PIX_HISTORY.filter((p) => p.type === "out").length} transações no mês`}
        />
        <Stat
          icon="check"
          variant="ok"
          label="PIX recebido"
          value={fmtBRL(totalReceivedMonth)}
          meta={`${PIX_HISTORY.filter((p) => p.type === "in").length} transações no mês`}
        />
        <Stat
          icon="clock"
          variant="amber"
          label="Agendados"
          value={fmtBRL(scheduledTotal)}
          meta={`${PIX_SCHEDULED.length} próximos`}
        />
        <Stat
          icon="bot"
          variant="indigo"
          label="Aprovações pendentes"
          value="2"
          meta="Ricardo aguardando OK"
        />
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-card border border-hair rounded-md p-[3px] self-start">
        {[
          { id: "enviar", label: "Enviar PIX", icon: "send" as const },
          { id: "historico", label: "Histórico", icon: "clock" as const },
          { id: "agendados", label: "Agendados", icon: "calendar" as const, count: PIX_SCHEDULED.length },
          { id: "minhas-chaves", label: "Minhas chaves", icon: "card" as const },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "px-[12px] py-[6px] rounded text-[12px] font-semibold flex items-center gap-[5px] transition-colors",
              tab === t.id ? "bg-accent text-white" : "text-ink-2 hover:bg-bg"
            )}
          >
            <Icon name={t.icon} size={12} />
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-bold px-[5px] py-px rounded",
                  tab === t.id ? "bg-white/20 text-white" : "bg-hair-2 text-ink-3"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "enviar" && (
        <div className="grid grid-cols-[360px_1fr] gap-3">
          <QuickSend />
          <div className="flex flex-col gap-3">
            <div className="bg-card border border-hair rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">Favoritos</div>
                <div className="flex gap-1">
                  <FavChip active={filterCat === "all"} onClick={() => setFilterCat("all")}>
                    Todos
                  </FavChip>
                  {(["familia", "fornecedor"] as const).map((c) => (
                    <FavChip key={c} active={filterCat === c} onClick={() => setFilterCat(c)}>
                      {CATEGORY_LABEL[c]}
                    </FavChip>
                  ))}
                  <FavChip active={false} onClick={() => {}}>
                    + Adicionar
                  </FavChip>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredFavorites.map((fav) => (
                  <FavoriteItem key={fav.id} fav={fav} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "historico" && <HistoryList items={PIX_HISTORY} />}
      {tab === "agendados" && <ScheduledList items={PIX_SCHEDULED} />}
      {tab === "minhas-chaves" && <MyKeys />}
    </div>
  )
}

function QuickSend() {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  return (
    <div className="bg-card border border-hair rounded-lg p-5 flex flex-col gap-3 h-fit">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-md bg-accent text-white flex items-center justify-center">
          <Icon name="send" size={17} />
        </div>
        <div>
          <div className="text-[14px] font-bold text-ink tracking-[-.2px]">Enviar PIX</div>
          <div className="text-[11px] text-ink-3 font-medium mt-px">
            Cole chave, escaneie QR ou escolha favorito
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em]">
          Chave PIX ou QR Code
        </label>
        <div className="flex gap-2">
          <input
            placeholder="CPF, CNPJ, e-mail, celular ou aleatória"
            className="flex-1 bg-bg border border-hair rounded-md px-[13px] py-[9px] text-[13px] text-ink outline-none focus:border-accent focus:bg-card transition-all"
          />
          <button className="px-3 rounded-md border border-hair bg-card text-ink-2 hover:bg-bg hover:border-ink-4 transition-colors">
            <Icon name="grid" size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em]">Valor</label>
        <div className="flex items-center bg-bg border border-hair rounded-md px-[13px] focus-within:border-accent focus-within:bg-card transition-all">
          <span className="text-[14px] font-bold text-ink-3 mr-2">R$</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="flex-1 py-[9px] text-[18px] font-bold text-ink mono tabular bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em]">
          Mensagem (opcional)
        </label>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: pagamento NF 4521"
          className="bg-bg border border-hair rounded-md px-[13px] py-[9px] text-[13px] text-ink outline-none focus:border-accent focus:bg-card transition-all"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em]">
          Conta de origem
        </label>
        <select className="bg-bg border border-hair rounded-md px-[13px] py-[9px] text-[13px] text-ink font-semibold outline-none focus:border-accent focus:bg-card cursor-pointer transition-all">
          <option>Itaú PJ Vimar · Ag 0001 · CC 45678-9 · R$ 487.320</option>
          <option>Itaú · Ag 0001 · CC 12345-6 · R$ 47.810</option>
          <option>Bradesco PJ Obras · Ag 0567 · CC 12345-0</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button className="bg-card border border-hair text-ink py-[10px] rounded-md text-[12.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center gap-1">
          <Icon name="calendar" size={13} />
          Agendar
        </button>
        <button className="bg-accent text-white border border-accent py-[10px] rounded-md text-[12.5px] font-semibold hover:bg-accent-hover transition-colors flex items-center justify-center gap-1">
          Enviar PIX
          <Icon name="send" size={13} />
        </button>
      </div>

      <div className="text-[10.5px] text-ink-3 font-medium leading-[1.5] mt-1 pt-3 border-t border-hair-2">
        🔒 Valores acima de <strong className="text-ink">R$ 1.000</strong> exigem confirmação 2FA. PIX
        para fornecedor &gt; R$ 50k pede aprovação do Ricardo.
      </div>
    </div>
  )
}

function FavoriteItem({ fav }: { fav: PixFavorite }) {
  return (
    <button className="bg-bg border border-hair rounded-md p-3 flex items-center gap-3 text-left hover:border-accent hover:bg-accent-soft/50 transition-colors group">
      <div
        className={cn(
          "w-10 h-10 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0",
          TONE_AV[fav.tone]
        )}
      >
        {fav.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold text-ink tracking-[-.15px] truncate">{fav.name}</div>
        <div className="text-[10.5px] text-ink-3 font-medium mono mt-px">
          {KEY_LABEL[fav.keyType]} · {fav.keyMasked}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "text-[9.5px] font-bold px-[6px] py-px rounded border tracking-[.02em]",
              CATEGORY_CLS[fav.category]
            )}
          >
            {CATEGORY_LABEL[fav.category]}
          </span>
          {fav.lastSent && (
            <span className="text-[10px] text-ink-3 font-medium mono">
              Últ: {fmtBRLCompact(fav.lastSent.amount)}
            </span>
          )}
        </div>
      </div>
      <Icon name="chevron" size={13} className="text-ink-4 group-hover:text-accent" />
    </button>
  )
}

function HistoryList({ items }: { items: PixTx[] }) {
  return (
    <div className="bg-card border border-hair rounded-lg overflow-hidden">
      <div className="grid grid-cols-[60px_1fr_180px_120px_140px] px-4 py-2 border-b border-hair bg-bg text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
        <div></div>
        <div>Contraparte</div>
        <div>Conta · Mensagem</div>
        <div>Data</div>
        <div className="text-right">Valor</div>
      </div>
      {items.map((tx, i) => (
        <PixRow key={tx.id} tx={tx} last={i === items.length - 1} />
      ))}
    </div>
  )
}

function ScheduledList({ items }: { items: PixTx[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card border border-hair border-l-[3px] border-l-warn rounded-md px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-amber-50 text-warn border border-amber-200 flex items-center justify-center">
          <Icon name="clock" size={13} />
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
            {items.length} PIX agendados nos próximos 30 dias
          </div>
          <div className="text-[11px] text-ink-2 font-medium mt-px">
            Total: {fmtBRL(items.reduce((s, p) => s + p.amount, 0))} · Ricardo monitora fluxo de caixa
          </div>
        </div>
        <button className="text-[11.5px] font-semibold text-accent hover:text-accent-hover">
          Configurar alertas →
        </button>
      </div>
      <div className="bg-card border border-hair rounded-lg overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_180px_120px_140px] px-4 py-2 border-b border-hair bg-bg text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
          <div></div>
          <div>Contraparte</div>
          <div>Conta · Mensagem</div>
          <div>Agendado para</div>
          <div className="text-right">Valor</div>
        </div>
        {items.map((tx, i) => (
          <PixRow key={tx.id} tx={tx} last={i === items.length - 1} scheduled />
        ))}
      </div>
    </div>
  )
}

function PixRow({ tx, last, scheduled }: { tx: PixTx; last: boolean; scheduled?: boolean }) {
  const isIn = tx.type === "in"
  return (
    <div
      className={cn(
        "grid grid-cols-[60px_1fr_180px_120px_140px] items-center gap-3 px-4 py-3 hover:bg-bg cursor-pointer transition-colors",
        !last && "border-b border-hair-2"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center",
            isIn
              ? "bg-emerald-50 text-ok border border-emerald-200"
              : "bg-red-50 text-err border border-red-200"
          )}
        >
          <Icon name={isIn ? "check" : "send"} size={14} />
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-ink tracking-[-.15px] truncate">{tx.counterpart}</div>
        <div className="text-[11px] text-ink-3 font-medium mt-px flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-sm", BANK_COLORS[tx.bank])} />
          {tx.bankLabel}
        </div>
      </div>
      <div className="text-[11.5px] text-ink-2 font-medium leading-[1.4] truncate">
        {tx.message}
      </div>
      <div className="text-[11.5px] text-ink-2 font-semibold mono">
        {fmtDateTime(scheduled ? tx.scheduleDate ?? tx.date : tx.date)}
      </div>
      <div className="text-right">
        <div
          className={cn(
            "text-[14px] font-bold mono tabular tracking-[-.2px]",
            isIn ? "text-ok" : "text-ink"
          )}
        >
          {isIn ? "+" : "−"} {fmtBRL(tx.amount)}
        </div>
        {scheduled && (
          <div className="text-[10px] text-warn font-bold uppercase tracking-[.04em] mt-px">
            Aguardando
          </div>
        )}
      </div>
    </div>
  )
}

function MyKeys() {
  return (
    <div className="bg-card border border-hair rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[14px] font-bold text-ink tracking-[-.2px]">Suas chaves PIX</div>
          <div className="text-[11.5px] text-ink-3 font-medium mt-px">
            Limite de 5 chaves PF e 10 chaves PJ por banco
          </div>
        </div>
        <button className="px-[13px] py-[7px] rounded-md bg-accent text-white border border-accent text-[12.5px] font-semibold hover:bg-accent-hover transition-colors flex items-center gap-1">
          <Icon name="plus" size={13} />
          Cadastrar chave
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PIX_KEYS.map((k, i) => (
          <div
            key={i}
            className="bg-bg border border-hair rounded-md p-4 flex items-center gap-3 hover:border-accent transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-card border border-hair flex items-center justify-center text-ink-2">
              <Icon
                name={k.type === "email" ? "mail" : k.type === "phone" ? "phone" : "card"}
                size={16}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em]">
                {k.label}
              </div>
              <div className="text-[12.5px] font-bold text-ink mono mt-px truncate">{k.value}</div>
              <div className="text-[10.5px] text-ink-3 font-medium mt-px">{k.bank}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button className="w-7 h-7 rounded-md border border-hair bg-card text-ink-2 hover:border-accent hover:text-accent flex items-center justify-center transition-colors">
                <Icon name="grid" size={11} />
              </button>
              <button className="w-7 h-7 rounded-md border border-hair bg-card text-ink-2 hover:border-err hover:text-err flex items-center justify-center transition-colors">
                <Icon name="close" size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FavChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-[10px] py-[3px] rounded-full border text-[11px] font-semibold transition-colors",
        active
          ? "bg-accent-soft border-indigo-200 text-accent"
          : "bg-card border-hair text-ink-2 hover:border-ink-4"
      )}
    >
      {children}
    </button>
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

function fmtBRLCompact(v: number): string {
  if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`
  return `R$ ${v.toFixed(0)}`
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const yest = new Date(today)
  yest.setDate(today.getDate() - 1)
  const isYest = d.toDateString() === yest.toDateString()
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  if (iso.length === 10) return `${day}/${month}` // só data
  if (isToday) return `Hoje · ${time}`
  if (isYest) return `Ontem · ${time}`
  return `${day}/${month} · ${time}`
}
