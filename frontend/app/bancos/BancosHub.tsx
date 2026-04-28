"use client"
import { useEffect, useState } from "react"
import type { ComponentProps } from "react"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import { EmptyState } from "@/components/ui/EmptyState"
import {
  banksAccounts,
  banksConnections,
  banksSummary,
  type RemoteAccount,
  type RemoteConnection,
} from "@/lib/api"

type Tab = {
  id: string
  label: string
  icon: ComponentProps<typeof Icon>["name"]
  soon?: boolean
}

const TABS: Tab[] = [
  { id: "geral", label: "Visão Geral", icon: "grid" },
  { id: "extrato", label: "Extrato", icon: "chart" },
  { id: "cartoes", label: "Cartões", icon: "card" },
  { id: "pix", label: "PIX & Operações", icon: "send" },
  { id: "boletos", label: "Boletos", icon: "file" },
  { id: "tributos", label: "Tributos", icon: "shield" },
  { id: "analise", label: "Análise", icon: "target" },
]

function fmtBRL(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function BancosHub() {
  const [tab, setTab] = useState("geral")
  const [connections, setConnections] = useState<RemoteConnection[]>([])
  const [accounts, setAccounts] = useState<RemoteAccount[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([banksConnections(), banksAccounts(), banksSummary().catch(() => null)])
      .then(([conn, accs, summary]) => {
        if (!mounted) return
        setConnections(conn)
        setAccounts(accs)
        setTotal(summary?.total ?? accs.reduce((s, a) => s + (a.balance || 0), 0))
      })
      .catch(() => {
        if (mounted) {
          setConnections([])
          setAccounts([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-bg-app overflow-hidden">
      <div className="bg-bg-surface border-b border-default flex overflow-x-auto px-5 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => !t.soon && setTab(t.id)}
            disabled={t.soon}
            className={cn(
              "px-3.5 py-3 text-small font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors border-b-2",
              tab === t.id
                ? "text-brand border-brand"
                : "text-text-tertiary border-transparent hover:text-text-secondary",
            )}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {tab === "geral" && (
          <GeralTab
            loading={loading}
            connections={connections}
            accounts={accounts}
            total={total}
          />
        )}

        {tab === "extrato" && <SimpleEmpty icon="chart" title="Sem extrato" subtitle="Conecte uma instituição na aba Visão Geral pra começar a ver lançamentos." />}
        {tab === "cartoes" && <SimpleEmpty icon="card" title="Sem cartões cadastrados" subtitle="Cadastro de cartões de crédito virá numa próxima entrega." />}
        {tab === "pix" && <SimpleEmpty icon="send" title="Sem operações PIX" subtitle="Histórico de PIX será exibido aqui quando o sistema estiver integrado." />}
        {tab === "boletos" && <SimpleEmpty icon="file" title="Sem boletos" subtitle="Boletos enviados via WhatsApp/e-mail aparecerão aqui pra agendamento." />}
        {tab === "tributos" && <SimpleEmpty icon="shield" title="Sem tributos" subtitle="DARFs, certidões e impostos por entidade aparecerão aqui." />}
        {tab === "analise" && <SimpleEmpty icon="target" title="Sem análise disponível" subtitle="Dashboards de análise serão habilitados quando houver dados suficientes." />}
      </div>
    </div>
  )
}

function GeralTab({
  loading,
  connections,
  accounts,
  total,
}: {
  loading: boolean
  connections: RemoteConnection[]
  accounts: RemoteAccount[]
  total: number | null
}) {
  if (loading) {
    return (
      <div className="text-center text-text-tertiary text-small py-12 font-medium">
        Carregando…
      </div>
    )
  }
  if (connections.length === 0 && accounts.length === 0) {
    return (
      <div className="bg-bg-surface border border-default rounded-xl">
        <EmptyState
          icon="bank"
          title="Nenhuma instituição conectada"
          subtitle={
            <>
              Use o Pluggy Open Finance pra conectar suas contas (Itaú, Nubank,
              Bradesco, etc.). Saldos, extratos e categorização ficam disponíveis
              em tempo real depois de conectar. Configuração pendente: definir
              <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-tiny mx-1">
                PLUGGY_CLIENT_ID
              </code>
              e
              <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-tiny mx-1">
                PLUGGY_CLIENT_SECRET
              </code>
              no .env do backend.
            </>
          }
        />
      </div>
    )
  }

  return (
    <>
      <div className="bg-bg-surface border border-default rounded-xl p-6">
        <div className="text-tiny uppercase tracking-wider text-text-tertiary font-medium">
          Saldo total
        </div>
        <div className="text-display text-text-primary tabular-nums mt-2">
          {fmtBRL(total)}
        </div>
        <div className="text-small text-text-secondary mt-1">
          {accounts.length} conta(s) em {connections.length} instituição(ões)
        </div>
      </div>

      <div>
        <div className="text-tiny uppercase tracking-wider text-text-tertiary font-medium mb-3">
          Contas
        </div>
        <div className="bg-bg-surface border border-default rounded-lg overflow-hidden">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-default last:border-0 hover:bg-bg-subtle transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-bg-subtle border border-default flex items-center justify-center text-text-secondary shrink-0">
                <Icon name="bank" size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body-strong text-text-primary truncate">
                  {a.name}
                </div>
                <div className="text-small text-text-secondary mt-0.5">
                  {a.entity} · {a.type}
                  {a.agency ? ` · Ag. ${a.agency}` : ""} · {a.number}
                </div>
              </div>
              <div className="text-body tabular-nums font-medium text-text-primary">
                {fmtBRL(a.balance)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function SimpleEmpty({
  icon,
  title,
  subtitle,
}: {
  icon: ComponentProps<typeof Icon>["name"]
  title: string
  subtitle: string
}) {
  return (
    <div className="bg-bg-surface border border-default rounded-xl">
      <EmptyState icon={icon} title={title} subtitle={subtitle} />
    </div>
  )
}
