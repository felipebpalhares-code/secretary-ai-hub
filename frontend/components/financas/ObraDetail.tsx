import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

export function ObraDetail() {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-bg min-w-0">
      <div className="bg-card px-[22px] py-4 border-b border-hair">
        <div className="text-[11px] text-ink-3 mb-[6px] font-medium">
          Finanças › Vimar › <span className="text-ink font-semibold">Obra Bloco A · Residencial</span>
        </div>
        <div className="flex items-center gap-[14px]">
          <div className="w-11 h-11 rounded-md bg-bg border border-hair flex items-center justify-center text-[20px]">
            🏠
          </div>
          <div>
            <div className="text-[17px] font-bold text-ink tracking-[-.3px]">
              Bloco A · Residencial Curitiba
            </div>
            <div className="text-[11.5px] text-ink-2 mt-[2px] flex items-center gap-[10px] flex-wrap font-medium">
              <span>Av. Batel, 2341</span>
              <span>·</span>
              <span>Início 03/2024</span>
              <span>·</span>
              <span>Entrega 11/2026</span>
              <span>·</span>
              <span className="text-warn font-bold">67% concluída</span>
            </div>
          </div>
          <div className="ml-auto flex gap-[6px]">
            <button className="px-3 py-[7px] rounded-md border border-hair bg-card text-ink text-[12.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
              Editar
            </button>
            <button className="px-3 py-[7px] rounded-md border border-hair bg-card text-ink text-[12.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
              Relatório
            </button>
            <button className="px-3 py-[7px] rounded-md bg-accent text-white border border-accent text-[12.5px] font-semibold hover:bg-accent-hover transition-colors">
              Novo CC
            </button>
          </div>
        </div>
        <div className="flex gap-1 mt-3">
          {[
            ["Projeto", "done"],
            ["Fundação", "done"],
            ["Estrutura", "done"],
            ["Alvenaria", "doing"],
            ["Acabamento", "todo"],
            ["Entrega", "todo"],
          ].map(([label, state]) => (
            <div
              key={label}
              className={cn(
                "flex-1 py-[6px] text-center text-[10.5px] font-bold border rounded tracking-[-.05px]",
                state === "done" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                state === "doing" && "bg-amber-50 text-amber-800 border-amber-400",
                state === "todo" && "bg-hair-2 text-ink-3 border-hair"
              )}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[10px] px-[22px] pt-4">
        <StatBlock title="Orçado total" value="R$ 4,2M" meta="24 meses de obra" />
        <StatBlock title="Realizado" value="R$ 2,82M" meta="+8% acima do previsto" variant="amber" subDown />
        <StatBlock title="Vendas unidades" value="R$ 3,1M" meta="12 de 18 unidades" variant="green" subUp />
        <StatBlock title="Desvio" value="+R$ 208k" meta="material · empreiteiro" variant="red" subDown />
      </div>

      <div className="flex gap-0 px-[22px] pt-4 border-b border-hair bg-card mt-4 overflow-x-auto scrollbar-none">
        {["Visão Geral", "Centros de Custo", "Bancos", "Lançamentos", "Planilhas", "Fornecedores", "Unidades"].map(
          (t, i) => (
            <button
              key={t}
              className={cn(
                "px-[13px] py-[10px] text-[12px] font-semibold whitespace-nowrap border-b-2 transition-colors",
                i === 0 ? "text-accent border-accent" : "text-ink-3 border-transparent hover:text-ink-2"
              )}
            >
              {t}
            </button>
          )
        )}
      </div>

      <div className="px-[22px] py-[18px] flex flex-col gap-[18px]">
        <RicardoAlerts />
        <BudgetCard />
        <BanksSection />
        <CartasSection />
      </div>
    </div>
  )
}

function StatBlock({
  title,
  value,
  meta,
  variant,
  subUp,
  subDown,
}: {
  title: string
  value: string
  meta: string
  variant?: "green" | "red" | "amber" | "indigo"
  subUp?: boolean
  subDown?: boolean
}) {
  const border =
    variant === "green"
      ? "border-l-ok"
      : variant === "red"
        ? "border-l-err"
        : variant === "amber"
          ? "border-l-warn"
          : variant === "indigo"
            ? "border-l-accent"
            : "border-l-hair"
  return (
    <div className={cn("bg-card border border-hair border-l-[3px] rounded-md p-[12px_14px] flex flex-col gap-1", border)}>
      <div className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em]">{title}</div>
      <div className="text-[20px] font-bold text-ink tracking-[-.4px] tabular">{value}</div>
      <div
        className={cn(
          "text-[10.5px] font-medium",
          subUp ? "text-ok" : subDown ? "text-err" : "text-ink-2"
        )}
      >
        {meta}
      </div>
    </div>
  )
}

function RicardoAlerts() {
  return (
    <div>
      <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
        Alertas do Ricardo · CFO
      </div>
      <RicardoAlert variant="danger" title='CC "Material" 12% acima (R$ +96k)' meta="Aumento em aço e cimento (+14% vs 03/2026). Engenheiro recomenda renegociar com Siderúrgica SP." />
      <RicardoAlert variant="warn" title="3 boletos da obra vencem esta semana · R$ 84.200" meta="ArtCasa R$32k · Hidráulica Sul R$18k · Empreiteiro R$34k. Fluxo OK." />
      <RicardoAlert variant="default" title="Venda 2 unidades confirmada · entrada R$ 180k" meta="401 e 703 vendidas. Saldo Vimar: R$ 487.000." />
    </div>
  )
}

function RicardoAlert({
  variant,
  title,
  meta,
}: {
  variant: "default" | "warn" | "danger"
  title: string
  meta: string
}) {
  const border = variant === "danger" ? "border-l-err" : variant === "warn" ? "border-l-warn" : "border-l-ok"
  const avBg =
    variant === "danger" ? "bg-red-50 text-err" : variant === "warn" ? "bg-amber-50 text-warn" : "bg-emerald-50 text-ok"
  const sym = variant === "danger" ? "!" : variant === "warn" ? "!" : "✓"
  return (
    <div className={cn("bg-card border border-hair border-l-[3px] rounded-md p-[11px_14px] flex gap-[11px] items-start mb-2", border)}>
      <div className={cn("w-7 h-7 rounded-md flex items-center justify-center font-bold shrink-0", avBg)}>
        {sym}
      </div>
      <div>
        <div className="text-[12px] font-bold text-ink tracking-[-.1px]">{title}</div>
        <div className="text-[11px] text-ink-2 leading-[1.5] mt-[2px] font-medium">{meta}</div>
      </div>
    </div>
  )
}

function BudgetCard() {
  return (
    <div className="bg-card border border-hair rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12.5px] font-bold text-ink tracking-[-.15px] flex items-center gap-[7px]">
          <Icon name="target" size={14} className="text-ink-2" />
          Centros de custo · Orçado × Realizado
        </div>
        <button className="inline-flex items-center gap-[4px] text-[11.5px] font-semibold text-accent bg-accent-soft border border-indigo-200 px-[10px] py-1 rounded-md">
          <Icon name="plus" size={11} />
          Novo CC
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <CCRow
          icon="grid"
          name="Material (aço, cimento, tijolo)"
          tag="+12% acima"
          tagVariant="bad"
          orcado="R$ 800.000"
          realizado="R$ 896.200"
          realizadoVariant="red"
          dif="+R$ 96.200"
          difVariant="red"
          pct={100}
          pctText="112%"
          barVariant="bad"
        />
        <CCRow
          icon="users"
          name="Mão de obra / empreiteiro"
          tag="+4% acima"
          tagVariant="warn"
          orcado="R$ 1.100.000"
          realizado="R$ 1.144.000"
          dif="+R$ 44.000"
          difVariant="red"
          pct={100}
          pctText="104%"
          barVariant="warn"
        />
        <CCRow
          icon="edit"
          name="Projetos e engenharia"
          tag="Dentro"
          tagVariant="ok"
          orcado="R$ 280.000"
          realizado="R$ 268.000"
          realizadoVariant="green"
          dif="-R$ 12.000"
          difVariant="green"
          pct={96}
          pctText="96%"
          barVariant="ok"
        />
        <CCRow
          icon="building"
          name="Equipamentos e locações"
          tag="Dentro"
          tagVariant="ok"
          orcado="R$ 340.000"
          realizado="R$ 241.000"
          dif="-R$ 99.000"
          difVariant="green"
          pct={71}
          pctText="71%"
          barVariant="ok"
        />
      </div>
    </div>
  )
}

function CCRow({
  icon,
  name,
  tag,
  tagVariant,
  orcado,
  realizado,
  realizadoVariant,
  dif,
  difVariant,
  pct,
  pctText,
  barVariant,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  name: string
  tag: string
  tagVariant: "ok" | "warn" | "bad"
  orcado: string
  realizado: string
  realizadoVariant?: "red" | "green"
  dif: string
  difVariant: "red" | "green"
  pct: number
  pctText: string
  barVariant: "ok" | "warn" | "bad"
}) {
  const tagCls = {
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    bad: "bg-red-50 text-red-700 border-red-200",
  }[tagVariant]
  const barCls = { ok: "bg-ok", warn: "bg-warn", bad: "bg-err" }[barVariant]
  return (
    <div className="bg-bg border border-hair rounded-md p-[11px_13px]">
      <div className="flex items-center gap-[10px] mb-2">
        <div className="w-7 h-7 rounded-md bg-card border border-hair flex items-center justify-center text-ink-2 shrink-0">
          <Icon name={icon} size={13} />
        </div>
        <div className="text-[12.5px] font-bold text-ink flex-1 tracking-[-.15px]">{name}</div>
        <span className={cn("text-[10px] font-bold px-2 py-[2px] rounded border", tagCls)}>{tag}</span>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-[10px] text-[11px] items-center">
        <Field label="Orçado" value={orcado} />
        <Field label="Realizado" value={realizado} variant={realizadoVariant} />
        <Field label="Diferença" value={dif} variant={difVariant} />
        <Field label="%" value={pctText} alignRight />
      </div>
      <div className="h-1 bg-hair rounded-full overflow-hidden mt-[7px]">
        <div className={cn("h-full rounded-full", barCls)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  variant,
  alignRight,
}: {
  label: string
  value: string
  variant?: "red" | "green"
  alignRight?: boolean
}) {
  return (
    <div className={cn("flex flex-col gap-px", alignRight && "text-right")}>
      <span className="text-[10px] text-ink-3 font-semibold uppercase tracking-[.03em]">{label}</span>
      <span
        className={cn(
          "font-bold text-[12.5px] mono",
          variant === "red" ? "text-err" : variant === "green" ? "text-ok" : "text-ink"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function BanksSection() {
  const banks = [
    { name: "Itaú PJ · Vimar", sub: "Ag 0001 · CC 45678-9", bal: "R$ 487.320", sync: "2 min", status: "Sync" },
    { name: "Bradesco PJ · Obras", sub: "Ag 0567 · CC 12345-0", bal: "R$ 182.100", sync: "4 min", status: "Sync" },
    { name: "BB PJ · Poupança", sub: "Ag 3214 · CP 98765-2", bal: "R$ 64.500", sync: "12h", status: "Sync..." },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-[10px]">
        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
          Contas conectadas · Pluggy Open Finance
        </div>
        <button className="inline-flex items-center gap-[4px] text-[11.5px] font-semibold text-accent bg-accent-soft border border-indigo-200 px-[10px] py-1 rounded-md">
          <Icon name="plus" size={11} />
          Conectar
        </button>
      </div>
      <div className="grid grid-cols-3 gap-[10px]">
        {banks.map((b, i) => (
          <div key={i} className="bg-card border border-hair rounded-md p-[12px_14px] flex flex-col gap-2">
            <div className="flex items-center gap-[10px]">
              <div className="w-[30px] h-[30px] rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
                <Icon name="bank" size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-bold text-ink truncate tracking-[-.15px]">{b.name}</div>
                <div className="text-[10.5px] text-ink-3 mono font-medium">{b.sub}</div>
              </div>
              <span
                className={cn(
                  "text-[9.5px] font-bold px-[6px] py-px rounded border",
                  b.status === "Sync"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-accent-soft text-accent border-indigo-200"
                )}
              >
                {b.status}
              </span>
            </div>
            <div className="flex items-baseline gap-[6px]">
              <span className="text-[16px] font-bold text-ink tabular">{b.bal}</span>
              <span className="text-[10px] text-ink-3 font-semibold">saldo</span>
            </div>
            <div className="text-[10.5px] text-ink-3 font-medium">
              Último sync <b className="text-ink font-bold">{b.sync}</b>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CartasSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-[10px]">
        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
          Cartas de crédito · consórcios
        </div>
        <button className="inline-flex items-center gap-[4px] text-[11.5px] font-semibold text-accent bg-accent-soft border border-indigo-200 px-[10px] py-1 rounded-md">
          <Icon name="plus" size={11} />
          Nova
        </button>
      </div>

      <Carta
        state="lance"
        title="Porto Seguro · Imóveis"
        sub="Grupo 8472 · Cota 023"
        fields={[
          { l: "Valor", v: "R$ 600.000", big: true },
          { l: "Parcela", v: "R$ 3.870/mês" },
          { l: "Já pago", v: "R$ 147.060 (38%)" },
          { l: "Uso", v: "Terreno Obra E" },
        ]}
        progress={{ pct: 38, text: "38 de 100 parcelas", when: "Próx assembleia 15/05", variant: "warn" }}
      />

      <Carta
        state="contemp"
        title="BB Consórcio · Imóveis"
        sub="Grupo 1023 · Cota 087"
        fields={[
          { l: "Valor", v: "R$ 450.000", big: true },
          { l: "Contemplada", v: "12/03/2026" },
          { l: "Usada em", v: "Obra Bloco A" },
          { l: "Saldo devedor", v: "R$ 198.200", variant: "red" },
        ]}
      />

      <Carta
        state="ativa"
        title="Itaú · Imóveis Premium"
        sub="Grupo 5501 · Cota 014"
        fields={[
          { l: "Valor", v: "R$ 800.000", big: true },
          { l: "Parcela", v: "R$ 4.920/mês" },
          { l: "Já pago", v: "R$ 59.040 (8%)" },
          { l: "Uso", v: "Obra Bloco F" },
        ]}
        progress={{ pct: 8, text: "12 de 150 parcelas", when: "Próx 22/05", variant: "ok" }}
      />
    </div>
  )
}

function Carta({
  state,
  title,
  sub,
  fields,
  progress,
}: {
  state: "ativa" | "contemp" | "lance"
  title: string
  sub: string
  fields: { l: string; v: string; big?: boolean; variant?: "red" | "green" }[]
  progress?: { pct: number; text: string; when: string; variant: "ok" | "warn" | "bad" }
}) {
  const border =
    state === "contemp" ? "border-l-ok" : state === "lance" ? "border-l-warn" : "border-l-purple-600"
  const stateCls =
    state === "contemp"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : state === "lance"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-accent-soft text-accent border-indigo-200"
  const stateLabel = state === "contemp" ? "Contemplada" : state === "lance" ? "Em lance" : "Ativa"
  const barCls = progress ? { ok: "bg-ok", warn: "bg-warn", bad: "bg-err" }[progress.variant] : ""
  return (
    <div className={cn("bg-card border border-hair border-l-[3px] rounded-md p-4 mb-2", border)}>
      <div className="flex items-center gap-[10px] mb-[10px]">
        <div className="w-[30px] h-[30px] rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
          <Icon name="card" size={14} />
        </div>
        <div>
          <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">{title}</div>
          <div className="text-[10.5px] text-ink-3 font-medium mt-px">{sub}</div>
        </div>
        <span className={cn("ml-auto text-[9.5px] font-bold px-2 py-[2px] rounded border tracking-[.02em]", stateCls)}>
          {stateLabel}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-[10px] text-[11px]">
        {fields.map((f, i) => (
          <div key={i} className="flex flex-col gap-px">
            <span className="text-[10px] text-ink-3 font-semibold uppercase tracking-[.03em]">{f.l}</span>
            <span
              className={cn(
                "font-bold mono",
                f.big ? "text-[14px] text-purple-700" : "text-[12.5px]",
                f.variant === "red" && "text-err",
                f.variant === "green" && "text-ok"
              )}
            >
              {f.v}
            </span>
          </div>
        ))}
      </div>
      {progress && (
        <div className="mt-[10px]">
          <div className="flex justify-between text-[10.5px] text-ink-3 mb-1 font-medium">
            <span>{progress.text}</span>
            <span>{progress.when}</span>
          </div>
          <div className="h-1 bg-hair rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", barCls)} style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
