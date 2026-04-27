import { TopBar, IconButton, Button } from "@/components/TopBar"
import { Icon } from "@/components/Icon"
import { ChannelCard } from "@/components/settings/ChannelCard"
import { PhoneMockup } from "@/components/settings/PhoneMockup"
import { ConfigPanel } from "@/components/settings/ConfigPanel"
import { UnifiedLogs } from "@/components/settings/UnifiedLogs"
import { WhatsAppChannelCard, WhatsAppQrPanel } from "@/components/settings/WhatsAppPanel"

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
            <WhatsAppChannelCard />
            <ChannelCard
              name="Telegram"
              sub="Bot · Arquivos grandes"
              iconName="send"
              status="off"
              statusLabel="Não configurado"
              phone="—"
              phoneMuted
              stats={[
                { v: "—", l: "Msgs hoje" },
                { v: "—", l: "Arquivos" },
                { v: "—", l: "Agentes" },
              ]}
              topColor="indigo"
              primaryLabel="Conectar"
              secondaryLabel="Guia"
            />
            <ChannelCard
              name="Discord"
              sub="Servidor · Histórico rico"
              iconName="globe"
              status="off"
              statusLabel="Não configurado"
              phone="—"
              phoneMuted
              stats={[
                { v: "—", l: "Canais" },
                { v: "—", l: "Msgs" },
                { v: "—", l: "Agentes" },
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
              <div className="w-10 h-10 rounded-md bg-card border border-hair flex items-center justify-center text-ink-2">
                <Icon name="chat" size={18} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-ink tracking-[-.25px]">
                  Felipe Hub · Linha única
                </div>
                <div className="text-[11px] text-ink-3 font-semibold mt-px">
                  Status em tempo real abaixo
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[300px_1fr_320px] min-h-[540px]">
              <WhatsAppQrPanel />
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
