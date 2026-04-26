import { TopBar, IconButton, Button } from "@/components/TopBar"
import { Icon } from "@/components/Icon"
import { ChannelCard } from "@/components/settings/ChannelCard"
import { PhoneMockup } from "@/components/settings/PhoneMockup"
import { ConfigPanel } from "@/components/settings/ConfigPanel"

export default function ConfiguracoesPage() {
  return (
    <>
      <TopBar
        title="Conexões Externas"
        subtitle="Configurações · canais de comunicação"
        actions={
          <>
            <IconButton name="bell" />
            <Button variant="primary" icon="plus">
              Novo canal
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-[22px] flex flex-col gap-[22px]">
        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
            Canais disponíveis
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ChannelCard
              name="WhatsApp"
              sub="Canal principal · Evolution API"
              iconName="chat"
              status="on"
              statusLabel="Conectado"
              phone="+55 41 99876-5432"
              stats={[
                { v: "147", l: "Msgs hoje" },
                { v: "12", l: "Alertas" },
                { v: "8/8", l: "Agentes" },
              ]}
              topColor="ok"
              primaryLabel="Configurar"
              secondaryLabel="Logs"
            />
            <ChannelCard
              name="Telegram"
              sub="Bot · Arquivos grandes"
              iconName="send"
              status="off"
              statusLabel="Configurar"
              phone="@FelipeHubBot (pendente)"
              phoneMuted
              stats={[
                { v: "—", l: "Msgs hoje" },
                { v: "—", l: "Arquivos" },
                { v: "0/8", l: "Agentes" },
              ]}
              topColor="indigo"
              primaryLabel="Conectar"
              secondaryLabel="Guia"
            />
            <ChannelCard
              name="Discord"
              sub="Servidor · Histórico rico"
              iconName="globe"
              status="idle"
              statusLabel="Pendente"
              phone="Felipe Hub Server"
              phoneMuted
              stats={[
                { v: "—", l: "Canais" },
                { v: "—", l: "Msgs" },
                { v: "0/8", l: "Agentes" },
              ]}
              topColor="purple"
              primaryLabel="Conectar"
              secondaryLabel="Guia"
            />
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
            WhatsApp · Canal principal
          </div>
          <div className="bg-card border border-hair rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-hair bg-bg">
              <div className="w-10 h-10 rounded-md bg-card border border-hair flex items-center justify-center text-ok">
                <Icon name="chat" size={18} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-ink tracking-[-.25px]">
                  Felipe Hub · Linha única
                </div>
                <div className="text-[11px] text-ok font-semibold mt-px flex items-center gap-1">
                  <span className="w-[6px] h-[6px] rounded-full bg-ok" />
                  Online · +55 41 99876-5432 · Evolution v2.1
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[300px_1fr_320px] min-h-[540px]">
              <QrPanel />
              <PhoneMockup />
              <ConfigPanel />
            </div>
          </div>
        </div>

        <UnifiedLogs />
      </div>
    </>
  )
}

function QrPanel() {
  return (
    <div className="p-5 border-r border-hair flex flex-col gap-3">
      <div className="text-[11.5px] font-bold text-ink-2 uppercase tracking-[.05em]">Conexão ativa</div>
      <div className="bg-bg border border-hair rounded-md p-4 flex flex-col items-center gap-3">
        <div
          className="w-40 h-40 border-2 border-ink rounded-lg relative flex items-center justify-center"
          style={{
            background:
              "repeating-conic-gradient(#0f172a 0% 25%, transparent 0% 50%) 50% / 8px 8px, repeating-linear-gradient(0deg, #0f172a 0% 3%, transparent 3% 6%)",
          }}
        >
          <span className="absolute w-10 h-10 bg-ok rounded-lg border-[3px] border-card" />
        </div>
        <div className="text-[11.5px] text-ok font-bold flex items-center gap-1">
          <Icon name="check" size={13} />
          Conectado
        </div>
        <div className="text-[14px] font-bold text-ink mono">+55 41 99876-5432</div>
        <button className="w-full px-2 py-[7px] rounded-md border border-red-200 bg-red-50 text-err text-[11.5px] font-semibold hover:bg-red-100 transition-colors">
          Desconectar sessão
        </button>
      </div>
      <div className="text-[10.5px] text-ink-2 leading-[1.6] font-medium">
        <strong className="text-ink">Stack</strong>
        <br />• Evolution API em <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10px] text-ink-2">vps.felipehub.com:8080</code>
        <br />• Webhook <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10px] text-ink-2">/api/webhooks/whatsapp</code>
        <br />• <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10px] text-ink-2">EVOLUTION_API_KEY</code> configurada
        <br />• Última sync: há 3s
      </div>
    </div>
  )
}

function UnifiedLogs() {
  const items = [
    {
      from: "Felipe",
      to: "Dr. Silva",
      toCls: "bg-purple-50 text-purple-700 border-purple-200",
      msg: '"S, pode avisar" · confirmação para contactar Dr. Carlos Lima',
      time: "07:17",
      badge: { text: "respondida", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    },
    {
      from: "Dr. Silva",
      fromCls: "bg-purple-50 text-purple-700 border-purple-200",
      to: "Felipe",
      msg: "Processo 0001234-56.2024 · prazo em 12 dias · OK hoje?",
      time: "07:16",
      badge: { text: "urgente", cls: "bg-red-50 text-red-700 border-red-200" },
    },
    {
      from: "Felipe",
      to: "Hub menu",
      toCls: "bg-accent-soft text-accent border-indigo-200",
      msg: '"menu" · solicitação de menu de agentes',
      time: "07:15",
    },
    {
      from: "Ricardo",
      fromCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      to: "Felipe",
      msg: "Fatura Nubank R$ 3.240 vence amanhã · pagar? (S/N)",
      time: "12:00",
      badge: { text: "confirmação", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    },
    {
      from: "Felipe",
      to: "Ricardo",
      toCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      msg: '"S" · autorização pagamento Nubank',
      time: "12:03",
      badge: { text: "respondida", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    },
    {
      from: "Ana",
      fromCls: "bg-pink-50 text-pink-700 border-pink-200",
      to: "Felipe",
      msg: "Aniversário Ana amanhã · Mistura Oficial 20h reservada · confirma?",
      time: "12:01",
      badge: { text: "lembrete", cls: "bg-accent-soft text-accent border-indigo-200" },
    },
  ] as {
    from: string
    fromCls?: string
    to: string
    toCls?: string
    msg: string
    time: string
    badge?: { text: string; cls: string }
  }[]

  return (
    <div>
      <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
        Log unificado de mensagens
      </div>
      <div className="bg-card border border-hair rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-[18px] py-3 border-b border-hair">
          <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
            Últimas mensagens (todos os canais)
          </div>
          <div className="flex gap-[5px]">
            {["Todos", "WhatsApp", "Telegram", "Discord"].map((f, i) => (
              <button
                key={f}
                className={
                  i === 0
                    ? "bg-accent-soft border border-indigo-200 text-accent px-[10px] py-1 rounded-full text-[11px] font-semibold"
                    : "bg-card border border-hair text-ink-2 px-[10px] py-1 rounded-full text-[11px] font-semibold hover:border-ink-4 transition-colors"
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-[10px] px-[18px] py-[10px] border-b border-hair-2 last:border-b-0 hover:bg-bg text-[11.5px] cursor-pointer transition-colors"
          >
            <div className="w-[22px] h-[22px] rounded-md bg-bg border border-hair flex items-center justify-center text-[10px] font-bold text-ink-2 shrink-0">
              WA
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-[6px] items-center flex-wrap">
                {item.fromCls ? (
                  <span className={`text-[9.5px] font-bold px-[6px] py-px rounded border ${item.fromCls}`}>
                    {item.from}
                  </span>
                ) : (
                  <span className="font-bold text-ink">{item.from}</span>
                )}
                <span className="text-[10.5px] text-ink-3">→</span>
                {item.toCls ? (
                  <span className={`text-[9.5px] font-bold px-[6px] py-px rounded border ${item.toCls}`}>
                    {item.to}
                  </span>
                ) : (
                  <span className="font-bold text-ink">{item.to}</span>
                )}
                {item.badge && (
                  <span className={`text-[9.5px] font-bold px-[6px] py-px rounded border ${item.badge.cls}`}>
                    {item.badge.text}
                  </span>
                )}
              </div>
              <div className="text-ink-2 mt-[2px] leading-[1.5] font-medium">{item.msg}</div>
            </div>
            <div className="text-[10px] text-ink-3 shrink-0 w-[52px] text-right font-medium">{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
