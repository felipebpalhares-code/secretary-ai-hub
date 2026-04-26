/** Vistas alternativas pro centro do /financas conforme nó selecionado na árvore */
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

/* ─── Visão geral consolidada ─────────────────────── */
export function ConsolidadoView() {
  const entities = [
    { name: "Felipe Palhares · PF", value: "R$ 1,38M", trend: "+2,3%", up: true, accs: 3 },
    { name: "PalharesTech Ltda.", value: "R$ 492.500", trend: "+4,2%", up: true, accs: 2 },
    { name: "Distribuidora Braz", value: "R$ 117.600", trend: "−1,1%", up: false, accs: 2 },
    { name: "Vimar Empreendimentos", value: "R$ 733.920", trend: "+5,7%", up: true, accs: 3 },
  ]
  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="bg-card px-[22px] py-4 border-b border-hair">
        <div className="text-[11px] text-ink-3 mb-[6px] font-medium">Finanças › Consolidado</div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-md bg-bg border border-hair flex items-center justify-center text-[20px]">📊</div>
          <div>
            <div className="text-[17px] font-bold text-ink tracking-[-.3px]">Visão consolidada · Felipe Hub</div>
            <div className="text-[11.5px] text-ink-2 mt-[2px] font-medium">
              4 entidades · 10 contas conectadas · sync há 2 min
            </div>
          </div>
        </div>
      </div>
      <div className="px-[22px] pt-4 grid grid-cols-3 gap-3">
        <Stat label="Patrimônio total" value="R$ 2,72M" sub="+R$ 87k últimos 30d" tone="ok" />
        <Stat label="Entrada do mês" value="R$ 487k" sub="62 transações" tone="ok" />
        <Stat label="Saída do mês" value="R$ 358k" sub="184 transações" tone="err" />
      </div>
      <div className="px-[22px] py-4 grid grid-cols-2 gap-3">
        {entities.map((e) => (
          <div key={e.name} className="bg-card border border-hair rounded-md p-4 hover:border-ink-4 transition-colors cursor-pointer">
            <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">{e.name}</div>
            <div className="text-[20px] font-bold mono tabular text-ink mt-1">{e.value}</div>
            <div className="text-[11px] text-ink-3 font-medium mt-1 flex justify-between">
              <span>{e.accs} contas conectadas</span>
              <span className={e.up ? "text-ok font-bold" : "text-err font-bold"}>{e.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Visão de Centro de Custo (CC) ───────────────── */
export function CCView({ name, parent }: { name: string; parent: string }) {
  const entries = [
    { date: "23/04", desc: "Transferência mensal", value: -8500 },
    { date: "20/04", desc: "Compras mercado · Pão de Açúcar", value: -487 },
    { date: "18/04", desc: "Mensalidade colégio", value: -3200 },
    { date: "10/04", desc: "Restaurante família", value: -284 },
  ]
  const total = entries.reduce((s, e) => s + e.value, 0)
  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="bg-card px-[22px] py-4 border-b border-hair">
        <div className="text-[11px] text-ink-3 mb-[6px] font-medium">
          Finanças › {parent} › <span className="text-ink font-semibold">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-md bg-accent-soft text-accent border border-indigo-200 flex items-center justify-center"><Icon name="target" size={18}/></div>
          <div>
            <div className="text-[17px] font-bold text-ink tracking-[-.3px]">{name}</div>
            <div className="text-[11.5px] text-ink-2 mt-[2px] font-medium">
              Centro de custo · {parent} · abril 2026
            </div>
          </div>
        </div>
      </div>
      <div className="px-[22px] pt-4 grid grid-cols-3 gap-3">
        <Stat label="Orçado abril" value="R$ 14.000" sub="meta mensal" tone="neutral" />
        <Stat label="Realizado" value="R$ 12.471" sub="89% do orçado" tone="ok" />
        <Stat label="Saldo" value="R$ 1.529" sub="restante no mês" tone="ok" />
      </div>
      <div className="px-[22px] py-4">
        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
          Lançamentos do CC · abril
        </div>
        <div className="bg-card border border-hair rounded-md overflow-hidden">
          {entries.map((e, i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[80px_1fr_140px] px-4 py-3 items-center",
                i !== entries.length - 1 && "border-b border-hair-2"
              )}
            >
              <div className="text-[12px] text-ink-2 font-semibold">{e.date}</div>
              <div className="text-[12.5px] font-bold text-ink tracking-[-.1px]">{e.desc}</div>
              <div className="text-right font-bold mono tabular text-ink">R$ {Math.abs(e.value).toLocaleString("pt-BR")}</div>
            </div>
          ))}
          <div className="grid grid-cols-[80px_1fr_140px] px-4 py-3 bg-bg border-t border-hair">
            <div className="col-span-2 text-right text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
              Total
            </div>
            <div className="text-right font-bold mono tabular text-[14px] text-ink">
              R$ {Math.abs(total).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Visão de Carta de Crédito ───────────────────── */
export function CartaView({
  name,
  status,
}: {
  name: string
  status: "ativa" | "lance" | "contemplada"
}) {
  const data: Record<string, any> = {
    "Porto Seguro #8472": {
      adm: "Porto Consórcio",
      group: "8472 · Cota 023",
      value: "R$ 600.000",
      parcela: "R$ 3.870",
      paid: "R$ 147.060 (38%)",
      use: "Terreno Obra E (futuro)",
      paidPct: 38,
      meeting: "15/05/2026",
    },
    "BB Consórcio #1023": {
      adm: "BB Consórcios",
      group: "1023 · Cota 087",
      value: "R$ 450.000",
      contemp: "12/03/2026",
      use: "Aplicado em Obra Bloco A",
      saldo: "R$ 198.200",
    },
    "Itaú Imóveis #5501": {
      adm: "Itaú Consórcios",
      group: "5501 · Cota 014",
      value: "R$ 800.000",
      parcela: "R$ 4.920",
      paid: "R$ 59.040 (8%)",
      use: "Reserva · Obra Bloco F",
      paidPct: 8,
      meeting: "22/05/2026",
    },
    "Bradesco Veículos #332": {
      adm: "Bradesco Consórcios",
      group: "332 · Cota 012",
      value: "R$ 180.000",
      parcela: "R$ 1.480",
      paid: "R$ 13.320 (7%)",
      use: "Trocar carro família",
      paidPct: 7,
      meeting: "30/05/2026",
    },
  }

  const d = data[name] ?? data["Porto Seguro #8472"]
  const statusLabel = status === "ativa" ? "Ativa" : status === "lance" ? "Em lance" : "Contemplada"
  const statusCls =
    status === "contemplada"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "lance"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-accent-soft text-accent border-indigo-200"

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="bg-card px-[22px] py-4 border-b border-hair">
        <div className="text-[11px] text-ink-3 mb-[6px] font-medium">
          Finanças › Cartas de Crédito › <span className="text-ink font-semibold">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center"><Icon name="card" size={18}/></div>
          <div className="flex-1">
            <div className="text-[17px] font-bold text-ink tracking-[-.3px]">{name}</div>
            <div className="text-[11.5px] text-ink-2 mt-[2px] font-medium">
              {d.adm} · Grupo {d.group}
            </div>
          </div>
          <span className={cn("text-[11px] font-bold px-3 py-1 rounded border", statusCls)}>{statusLabel}</span>
        </div>
      </div>

      <div className="px-[22px] pt-4 grid grid-cols-4 gap-3">
        <Stat label="Valor da carta" value={d.value} sub="poder de compra" tone="indigo" big />
        {d.parcela && <Stat label="Parcela mensal" value={d.parcela} sub="vencimento todo dia 12" tone="neutral" />}
        {d.paid && <Stat label="Já pago" value={d.paid} sub="acumulado" tone="ok" />}
        {d.contemp && <Stat label="Contemplada em" value={d.contemp} sub="lance vencedor" tone="ok" />}
        {d.saldo && <Stat label="Saldo devedor" value={d.saldo} sub="parcelas restantes" tone="err" />}
      </div>

      <div className="px-[22px] py-4 grid grid-cols-2 gap-3">
        <div className="bg-card border border-hair rounded-md p-4">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-2">
            Uso planejado
          </div>
          <div className="text-[14px] font-bold text-ink tracking-[-.2px]">{d.use}</div>
          {d.paidPct !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-ink-3 font-medium mb-1">
                <span>Progresso pagamento</span>
                <span className="text-ink font-bold">{d.paidPct}%</span>
              </div>
              <div className="h-2 bg-hair rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${d.paidPct}%` }} />
              </div>
            </div>
          )}
        </div>
        {d.meeting && (
          <div className="bg-card border border-hair rounded-md p-4">
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-2">
              Próxima assembleia
            </div>
            <div className="text-[14px] font-bold text-ink tracking-[-.2px] mono">{d.meeting}</div>
            <div className="text-[11.5px] text-ink-2 font-medium mt-2 leading-[1.5]">
              Ricardo monitora · alerta 7 dias antes pra você decidir lance.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Helpers ────────────────────────────────────── */
function Stat({
  label,
  value,
  sub,
  tone,
  big,
}: {
  label: string
  value: string
  sub: string
  tone: "ok" | "err" | "neutral" | "indigo"
  big?: boolean
}) {
  const cls = {
    ok: "border-l-ok",
    err: "border-l-err",
    neutral: "border-l-ink-4",
    indigo: "border-l-accent",
  }[tone]
  return (
    <div className={cn("bg-card border border-hair border-l-[3px] rounded-md p-4", cls)}>
      <div className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">{label}</div>
      <div className={cn("font-bold text-ink mono tabular tracking-[-.3px] mt-1", big ? "text-[24px]" : "text-[18px]")}>
        {value}
      </div>
      <div className="text-[10.5px] text-ink-3 font-medium mt-1">{sub}</div>
    </div>
  )
}
