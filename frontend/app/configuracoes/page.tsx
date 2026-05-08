import { TopBar, IconButton, Button } from "@/components/TopBar"
import { ChannelCard } from "@/components/settings/ChannelCard"
import { UnifiedLogs } from "@/components/settings/UnifiedLogs"
import { WhatsAppChannelCard, WhatsAppQrPanel } from "@/components/settings/WhatsAppPanel"
import { GoogleConnectCard } from "@/components/integrations/GoogleConnectCard"

export default function ConfiguracoesPage() {
  return (
    <>
      <TopBar
        title="Conexões Externas"
        subtitle="Configurações · canais de comunicação"
        actions={
          <>
            <IconButton name="bell" disabled title="Em breve" />
            <Button
              variant="primary"
              icon="plus"
              disabled
              title="Em breve · adicionar canal personalizado"
            >
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
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[2px]">
            Integrações Google
          </div>
          <div className="text-[11px] text-ink-3 font-medium mb-[10px]">
            Contatos · Gmail · Calendar
          </div>
          <GoogleConnectCard />
        </div>

        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
            Conectar WhatsApp
          </div>
          <div className="bg-card border border-hair rounded-lg overflow-hidden max-w-md">
            <WhatsAppQrPanel />
          </div>
        </div>

        <UnifiedLogs />
      </div>
    </>
  )
}
