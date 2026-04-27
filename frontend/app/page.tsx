import { TopBar, IconButton, Button } from "@/components/TopBar"
import { SectionTitle } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { Icon } from "@/components/Icon"

export default function PainelPage() {
  return (
    <>
      <TopBar
        title="Painel"
        subtitle="Visão geral da operação"
        actions={
          <>
            <IconButton name="search" />
            <IconButton name="bell" />
            <Button variant="primary" icon="plus">
              Nova tarefa
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-[22px]">
        <div>
          <SectionTitle>Visão geral</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon="bot" value="—" label="Agentes ativos" meta="Configure em /agentes" />
            <StatCard icon="users" value={0} label="Contatos" meta="Adicione em /contatos" />
            <StatCard icon="mail" value={0} label="E-mails não lidos" meta="Conecte sua caixa" />
            <StatCard icon="calendar" value={0} label="Eventos hoje" meta="Configure em /agenda" />
            <StatCard icon="file" value={0} label="Documentos" meta="Suba em /documentos" />
            <StatCard icon="bank" value={0} label="Bancos conectados" meta="Conecte em /bancos" />
          </div>
        </div>

        <div>
          <SectionTitle>Atenção necessária</SectionTitle>
          <div className="bg-card border border-hair rounded-lg p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-bg border border-hair flex items-center justify-center text-ink-3 mx-auto mb-3">
              <Icon name="check" size={20} />
            </div>
            <div className="text-[13px] font-bold text-ink mb-1">Nada pendente por enquanto</div>
            <div className="text-[11.5px] text-ink-3 font-medium max-w-md mx-auto">
              Conforme você configurar agentes, conectar bancos e cadastrar contatos, alertas relevantes vão aparecer aqui automaticamente.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
