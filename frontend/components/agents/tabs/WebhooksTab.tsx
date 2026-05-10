"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Webhook, X, Eye, EyeOff, Send, BookOpen, Copy, Check } from "lucide-react"
import {
  type Agent,
  type Webhook as Wh,
  type WebhookCreate,
  type WebhookEvent,
  createWebhook,
  deleteWebhook,
  listWebhooks,
  updateWebhook,
} from "@/lib/agents-api"
import { cn } from "@/lib/cn"
import { PermissionGate } from "@/components/auth/PermissionGate"

const EVENT_LABEL: Record<WebhookEvent, string> = {
  on_message_received: "Mensagem recebida",
  on_response_sent:    "Resposta enviada",
  on_action_taken:     "Ação executada",
}

export function WebhooksTab({ agent }: { agent: Agent }) {
  const [items, setItems]       = useState<Wh[] | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    listWebhooks(agent.id)
      .then((d) => !cancelled && setItems(d))
      .catch((e) => !cancelled && setError(String(e?.message ?? e)))
    return () => { cancelled = true }
  }, [agent.id])

  async function handleToggle(w: Wh) {
    setItems((arr) => (arr ? arr.map((i) => (i.id === w.id ? { ...i, active: !i.active } : i)) : arr))
    try {
      const next = await updateWebhook(w.id, { active: !w.active })
      setItems((arr) => (arr ? arr.map((i) => (i.id === next.id ? next : i)) : arr))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function handleDelete(id: string) {
    setItems((arr) => (arr ? arr.filter((i) => i.id !== id) : arr))
    try {
      await deleteWebhook(id)
    } catch (e) {
      setError((e as Error).message)
      const fresh = await listWebhooks(agent.id).catch(() => null)
      if (fresh) setItems(fresh)
    }
  }

  async function handleCreate(payload: WebhookCreate) {
    const created = await createWebhook(agent.id, payload)
    setItems((arr) => (arr ? [...arr, created] : [created]))
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-comfortable">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-subtitle text-text-primary">Webhooks de saída</h2>
            <p className="text-small text-text-secondary mt-1">
              Notificam sistemas externos (N8N, Zapier…) quando o agente recebe ou
              envia mensagens.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 text-small text-text-secondary hover:text-text-primary px-3 py-2 rounded-default hover:bg-bg-subtle transition"
            >
              <BookOpen size={14} strokeWidth={1.5} />
              Como usar com N8N?
            </button>
            <PermissionGate module="agentes" action="editar">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition"
              >
                <Plus size={14} strokeWidth={1.5} />
                Adicionar webhook
              </button>
            </PermissionGate>
          </div>
        </div>

        {error && (
          <div className="bg-danger-subtle border border-default rounded-md p-3 text-small text-danger">
            {error}
          </div>
        )}

        {items === null ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <div className="bg-bg-surface border border-default rounded-xl flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="text-text-tertiary">
              <Webhook size={48} strokeWidth={1.5} />
            </div>
            <div className="text-subtitle text-text-primary mt-3">Nenhum webhook configurado</div>
            <p className="text-body text-text-secondary mt-1 max-w-md">
              Configure webhooks pra integrar com N8N, Zapier ou outros sistemas.
            </p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-default rounded-md overflow-hidden">
            {items.map((w) => (
              <Row
                key={w.id}
                wh={w}
                onToggle={() => handleToggle(w)}
                onDelete={() => handleDelete(w.id)}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <WebhookModal
          onClose={() => setModalOpen(false)}
          onCreate={async (p) => {
            await handleCreate(p)
            setModalOpen(false)
          }}
        />
      )}

      {drawerOpen && <N8nDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  )
}

/* ───────── linha ───────── */

function Row({
  wh,
  onToggle,
  onDelete,
}: {
  wh: Wh
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-default last:border-0 hover:bg-bg-subtle transition">
      <span className="inline-flex items-center text-tiny font-medium px-2 py-0.5 rounded-sm border border-default bg-brand-subtle text-brand">
        {EVENT_LABEL[wh.event]}
      </span>
      <span className="flex-1 min-w-0 font-mono text-small text-text-primary truncate">{wh.url}</span>
      {wh.has_secret && (
        <span className="text-tiny text-text-tertiary" title="Assinado com HMAC-SHA256">
          🔒 assinado
        </span>
      )}
      <PermissionGate module="agentes" action="editar">
        <Toggle active={wh.active} onClick={onToggle} />
      </PermissionGate>
      <PermissionGate module="agentes" action="editar">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remover webhook"
          className="text-text-tertiary hover:text-danger p-1.5 rounded-default hover:bg-danger-subtle transition"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </PermissionGate>
    </div>
  )
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={active}
      className={cn(
        "relative w-9 h-5 rounded-full border transition-colors",
        active ? "bg-brand border-brand" : "bg-bg-muted border-default",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform",
          active && "translate-x-4",
        )}
      />
    </button>
  )
}

/* ───────── modal Adicionar webhook ───────── */

function WebhookModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (p: WebhookCreate) => Promise<void>
}) {
  const [event, setEvent] = useState<WebhookEvent>("on_response_sent")
  const [url, setUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testStatus, setTestStatus] = useState<null | { ok: boolean; message: string }>(null)

  const urlValid = useMemoUrlValid(url)

  async function handleTest() {
    if (!urlValid) return
    setTestStatus(null)
    try {
      const res = await fetch(url, {
        method: "POST",
        mode: "no-cors", // n8n / endpoints externos comumente respondem sem CORS amigável
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          agent_id: "test",
          timestamp: new Date().toISOString(),
          payload: { test: true, message: "Teste de webhook do Felipe Hub" },
        }),
      })
      // Em modo no-cors o status é sempre 0/opaque — sem certeza, mas a request saiu.
      setTestStatus({ ok: true, message: res.type === "opaque" ? "Enviado (resposta opaca por CORS)" : `HTTP ${res.status}` })
    } catch (e) {
      setTestStatus({ ok: false, message: (e as Error).message })
    }
  }

  async function handleSubmit() {
    if (!urlValid) return
    setSaving(true)
    try {
      await onCreate({ event, url, secret: secret || null, active })
    } catch (e) {
      setTestStatus({ ok: false, message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-surface rounded-xl shadow-lg max-w-xl w-full mx-4 p-8">
        <div className="flex items-start justify-between mb-loose">
          <div>
            <h2 className="text-title text-text-primary">Adicionar webhook</h2>
            <p className="text-body text-text-secondary mt-1">
              O backend envia POST com payload JSON quando o evento acontecer.
            </p>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary p-1 rounded-default" aria-label="Fechar">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-col gap-comfortable">
          <Field label="Evento">
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value as WebhookEvent)}
              className="w-full bg-bg-surface border border-default rounded-default px-3 py-2 text-body text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
            >
              <option value="on_message_received">Mensagem recebida (do usuário)</option>
              <option value="on_response_sent">Resposta enviada (pelo agente)</option>
              <option value="on_action_taken">Ação executada (futuro)</option>
            </select>
          </Field>

          <Field label="URL" error={url && !urlValid ? "URL inválida" : undefined}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://n8n.felipe.com/webhook/agent-resp"
              className={`w-full bg-bg-surface border rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition ${
                url && !urlValid
                  ? "border-danger focus:border-danger focus:ring-danger/10"
                  : "border-default focus:border-brand focus:ring-brand/10"
              }`}
            />
          </Field>

          <Field label="Secret (opcional, para assinatura HMAC-SHA256)">
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="chave compartilhada com o receptor"
                className="w-full bg-bg-surface border border-default rounded-default pr-10 pl-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1"
                aria-label={showSecret ? "Ocultar" : "Mostrar"}
              >
                {showSecret ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
              </button>
            </div>
          </Field>

          <label className="flex items-center gap-2 text-body text-text-primary">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-brand"
            />
            Ativar imediatamente
          </label>

          {testStatus && (
            <div
              className={`rounded-md p-2 text-small border border-default ${
                testStatus.ok ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
              }`}
            >
              {testStatus.message}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center gap-2 mt-loose">
          <button
            type="button"
            onClick={handleTest}
            disabled={!urlValid}
            className="inline-flex items-center gap-2 bg-bg-surface text-text-primary border border-default rounded-default px-3 py-2 text-small font-medium hover:bg-bg-subtle hover:border-strong transition disabled:opacity-50"
          >
            <Send size={13} strokeWidth={1.5} />
            Testar webhook
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="bg-bg-surface text-text-primary border border-default rounded-default font-medium px-4 py-2 text-body hover:bg-bg-subtle hover:border-strong transition">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!urlValid || saving}
              className="bg-brand text-white rounded-default font-medium px-4 py-2 text-body shadow-xs hover:bg-brand-hover transition disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-small text-text-secondary mb-1">{label}</label>
      {children}
      {error && <p className="text-small text-danger mt-1">{error}</p>}
    </div>
  )
}

/* ───────── drawer N8N ───────── */

const SAMPLE_PAYLOAD = `{
  "event": "on_response_sent",
  "agent_id": "5e6c2…",
  "timestamp": "2026-05-05T14:32:11Z",
  "payload": {
    "conversation_id": "c3a8…",
    "message_id":      "m7e1…",
    "content":         "<texto da resposta>",
    "tokens_used":     312
  }
}`

const SAMPLE_VERIFY = `// Em uma node Function logo após o Webhook node:
const crypto = require('crypto')
const secret = 'minha-chave-compartilhada'
const sig = $headers['x-webhook-signature']           // "sha256=..."
const expected = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update($input.item.json.bodyRaw ?? JSON.stringify($json))
  .digest('hex')
if (sig !== expected) throw new Error('Assinatura inválida')
return [$json]`

function N8nDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative ml-auto w-full max-w-lg h-full bg-bg-surface shadow-lg border-l border-default overflow-y-auto">
        <header className="sticky top-0 bg-bg-surface border-b border-default px-6 py-4 flex items-center justify-between">
          <h2 className="text-title text-text-primary">Como usar com N8N</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary p-1 rounded-default" aria-label="Fechar">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-6 py-loose flex flex-col gap-loose">
          <Step n={1} title="Crie um Webhook node no N8N">
            <p className="text-body text-text-secondary leading-relaxed">
              No editor do N8N, adicione um node <strong>Webhook</strong> com método
              <code className="bg-bg-subtle text-tiny px-1.5 py-0.5 rounded mx-1">POST</code>
              e copie a URL gerada.
            </p>
          </Step>

          <Step n={2} title="Cole a URL no formulário ao lado">
            <p className="text-body text-text-secondary leading-relaxed">
              Selecione o evento certo (mensagem recebida, resposta enviada…) e
              opcionalmente um secret pra assinatura HMAC.
            </p>
          </Step>

          <Step n={3} title="Estrutura do payload que o backend envia">
            <CodeBlock code={SAMPLE_PAYLOAD} />
            <p className="text-tiny text-text-tertiary mt-2">
              Headers extras: <code className="bg-bg-subtle text-tiny px-1.5 py-0.5 rounded">X-Webhook-Event</code>,
              <code className="bg-bg-subtle text-tiny px-1.5 py-0.5 rounded ml-1">X-Webhook-Agent-Id</code>,
              <code className="bg-bg-subtle text-tiny px-1.5 py-0.5 rounded ml-1">X-Webhook-Signature</code> (se houver secret).
            </p>
          </Step>

          <Step n={4} title="Verificando a assinatura (se usou secret)">
            <CodeBlock code={SAMPLE_VERIFY} />
          </Step>

          <Step n={5} title="Confiabilidade">
            <ul className="text-body text-text-secondary leading-relaxed list-disc list-inside space-y-1">
              <li>3 tentativas com backoff exponencial (1s → 2s → 4s)</li>
              <li>Falha não bloqueia o chat (fire-and-forget)</li>
              <li>Logs em <code className="bg-bg-subtle text-tiny px-1 py-0.5 rounded">/app/logs/webhooks.log</code></li>
            </ul>
          </Step>
        </div>
      </aside>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-brand-subtle text-brand text-tiny font-semibold flex items-center justify-center">
          {n}
        </span>
        <h3 className="text-subtitle text-text-primary">{title}</h3>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative">
      <pre className="text-tiny text-text-secondary whitespace-pre-wrap font-mono leading-relaxed bg-bg-subtle rounded-md p-4 overflow-x-auto">
        {code}
      </pre>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
            setCopied(true); setTimeout(() => setCopied(false), 1500)
          } catch { /* noop */ }
        }}
        className="absolute top-2 right-2 text-text-tertiary hover:text-text-primary p-1.5 rounded-default hover:bg-bg-surface transition"
        aria-label="Copiar"
      >
        {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
      </button>
    </div>
  )
}

/* ───────── helpers ───────── */

function ListSkeleton() {
  return (
    <div className="bg-bg-surface border border-default rounded-md overflow-hidden">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-default last:border-0">
          <div className="h-5 w-24 bg-bg-muted rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function useMemoUrlValid(url: string): boolean {
  try {
    if (!url) return false
    const u = new URL(url)
    return u.protocol === "https:" || u.protocol === "http:"
  } catch {
    return false
  }
}
