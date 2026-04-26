import { TopBar, IconButton, Button } from "@/components/TopBar"
import { SectionTitle } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { AlertCard } from "@/components/ui/AlertCard"

export default function PainelPage() {
  return (
    <>
      <TopBar
        title="Painel"
        subtitle="Visão geral da operação"
        actions={
          <>
            <IconButton name="search" />
            <IconButton name="bell" dot />
            <Button variant="primary" icon="plus">
              Nova tarefa
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-[22px]">
        {/* Summary cards */}
        <div>
          <SectionTitle>Visão geral</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon="bot"
              value={3}
              label="Agentes ativos"
              meta="Claude · GPT-4o · Gemini"
              trend={{ label: "● Online", variant: "up" }}
              progress={{ value: 100 }}
            />
            <StatCard
              icon="users"
              value={128}
              label="Contatos"
              meta="12 marcados como VIP"
              trend={{ label: "+4 novos", variant: "up" }}
              progress={{ value: 72 }}
            />
            <StatCard
              icon="mail"
              value={23}
              label="E-mails não lidos"
              meta="3 marcados como urgentes"
              trend={{ label: "+8 hoje", variant: "down" }}
              progress={{ value: 55, color: "err" }}
            />
            <StatCard
              icon="calendar"
              value={4}
              label="Eventos hoje"
              meta="Próximo às 14h00"
              trend={{ label: "Hoje", variant: "neutral" }}
              progress={{ value: 40, color: "warn" }}
            />
            <StatCard
              icon="file"
              value={47}
              label="Documentos"
              meta="5 aguardando revisão"
              trend={{ label: "+2 novos", variant: "up" }}
              progress={{ value: 63, color: "ok" }}
            />
            <StatCard
              icon="bank"
              value={3}
              label="Bancos conectados"
              meta="Último sync há 2 min"
              trend={{ label: "+R$1.2k", variant: "up" }}
              progress={{ value: 100 }}
            />
          </div>
        </div>

        {/* Alert cards */}
        <div>
          <SectionTitle>Atenção necessária</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <AlertCard
              title="Compromissos próximos"
              count="4 hoje"
              dotVariant="warn"
              footerLabel="Ver agenda completa"
              items={[
                {
                  icon: "phone",
                  title: "Call com equipe de produto",
                  meta: "Hoje · 13h00 · Google Meet",
                  tag: { label: "Em 1h", variant: "amber" },
                },
                {
                  icon: "users",
                  title: "Reunião com cliente Acme",
                  meta: "Hoje · 14h30 · Presencial",
                  tag: { label: "14h30", variant: "indigo" },
                },
                {
                  icon: "clock",
                  title: "Review semanal",
                  meta: "Hoje · 17h00 · Zoom",
                  tag: { label: "17h00", variant: "gray" },
                },
              ]}
            />
            <AlertCard
              title="E-mails importantes"
              count="3 urgentes"
              dotVariant="err"
              footerLabel="Ver todos os e-mails"
              items={[
                {
                  icon: "mail",
                  title: "Proposta comercial — prazo hoje",
                  meta: "De: joao@acme.com · 09h14",
                  tag: { label: "Urgente", variant: "red" },
                },
                {
                  icon: "file",
                  title: "Contrato para assinatura digital",
                  meta: "De: juridico@empresa.com · 08h52",
                  tag: { label: "Assinar", variant: "amber" },
                },
                {
                  icon: "money",
                  title: "Boleto vence amanhã — R$2.400",
                  meta: "De: financeiro@banco.com · 07h30",
                  tag: { label: "Pagar", variant: "red" },
                },
              ]}
            />
            <AlertCard
              title="Tarefas pendentes"
              count="7 abertas"
              dotVariant="indigo"
              footerLabel="Ver todas as tarefas"
              items={[
                {
                  icon: "zap",
                  title: "Finalizar relatório Q1",
                  meta: "Vence hoje · Alta prioridade",
                  tag: { label: "Atrasada", variant: "red" },
                },
                {
                  icon: "settings",
                  title: "Revisar configuração dos agentes",
                  meta: "Vence amanhã · Média prioridade",
                  tag: { label: "Amanhã", variant: "amber" },
                },
                {
                  icon: "send",
                  title: "Enviar NF para cliente",
                  meta: "Vence sex · Baixa prioridade",
                  tag: { label: "Sex", variant: "green" },
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
