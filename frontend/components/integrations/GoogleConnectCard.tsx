"use client"
import { useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/cn"
import {
  getStatus,
  disconnect,
  testConnection,
  googleStartUrl,
  syncGoogleContacts,
  getContactsSyncStatus,
  type GoogleStatus,
  type GoogleContact,
  type SyncReport,
} from "@/lib/google-api"

type Toast = { kind: "ok" | "err"; msg: string } | null
type TestState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ok"; contacts: GoogleContact[] }
  | { phase: "err"; msg: string }

function expiresLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (Number.isNaN(ms)) return null
  if (ms <= 0) return "expirado"
  const min = Math.round(ms / 60_000)
  if (min < 60) return `Token expira em ${min}min · auto-refresh ativo`
  const h = Math.round(min / 60)
  return `Token expira em ${h}h · auto-refresh ativo`
}

function relativeFromIso(iso: string | null): string | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 0) return null
  const min = Math.floor(ms / 60_000)
  if (min < 1) return "agora há pouco"
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  return `${d}d atrás`
}

type SyncState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; report: SyncReport }
  | { phase: "err"; msg: string }

export function GoogleConnectCard() {
  const [status, setStatus] = useState<GoogleStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [test, setTest] = useState<TestState>({ phase: "idle" })
  const [toast, setToast] = useState<Toast>(null)
  const [sync, setSync] = useState<SyncState>({ phase: "idle" })
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)

  // Lê status na carga inicial + sync-status quando conectado
  async function refresh() {
    try {
      const s = await getStatus()
      setStatus(s)
      if (s.connected) {
        try {
          const ss = await getContactsSyncStatus()
          setLastSyncAt(ss.last_sync_at)
        } catch {
          /* ignora — UI mostra "nunca" */
        }
      }
    } catch {
      setStatus({ connected: false, email: null, expires_at: null, scopes: [] })
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  // Processa query params do callback (`?google=connected` ou `?google=error&msg=…`)
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const flag = params.get("google")
    if (!flag) return

    if (flag === "connected") {
      void refresh()
      setToast({ kind: "ok", msg: "Conectado ao Google" })
      window.setTimeout(() => setToast(null), 5000)
    } else if (flag === "error") {
      const msg = params.get("msg") || "Falha ao conectar Google"
      setToast({ kind: "err", msg })
      window.setTimeout(() => setToast(null), 7000)
    }

    // Limpa os query params
    params.delete("google")
    params.delete("msg")
    const qs = params.toString()
    const url = window.location.pathname + (qs ? `?${qs}` : "")
    window.history.replaceState({}, "", url)
  }, [])

  function handleConnect() {
    if (typeof window !== "undefined") {
      window.location.href = googleStartUrl
    }
  }

  async function handleDisconnect() {
    if (busy) return
    setBusy(true)
    try {
      await disconnect()
      setStatus({ connected: false, email: null, expires_at: null, scopes: [] })
      setTest({ phase: "idle" })
      setToast({ kind: "ok", msg: "Google desconectado" })
      window.setTimeout(() => setToast(null), 4000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao desconectar"
      setToast({ kind: "err", msg })
      window.setTimeout(() => setToast(null), 6000)
    } finally {
      setBusy(false)
    }
  }

  async function handleTest() {
    setTest({ phase: "loading" })
    const res = await testConnection()
    if (res.ok) {
      setTest({ phase: "ok", contacts: res.contacts ?? [] })
    } else {
      setTest({ phase: "err", msg: res.error || "Falha ao buscar contatos" })
    }
  }

  async function handleSync() {
    setSync({ phase: "loading" })
    try {
      const res = await syncGoogleContacts()
      setSync({ phase: "done", report: res.report })
      setLastSyncAt(res.report.finished_at)
      setToast({
        kind: "ok",
        msg: `${res.report.count_imported} novos · ${res.report.count_updated} atualizados · ${res.report.count_skipped} ignorados`,
      })
      window.setTimeout(() => setToast(null), 6000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao sincronizar"
      setSync({ phase: "err", msg })
      setToast({ kind: "err", msg })
      window.setTimeout(() => setToast(null), 7000)
    }
  }

  const connected = status?.connected === true
  const expiry = connected ? expiresLabel(status?.expires_at ?? null) : null

  return (
    <div className="bg-card border border-hair border-t-2 border-t-accent rounded-lg p-4 flex flex-col gap-3 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-[11px]">
        <div className="w-9 h-9 rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
          <Icon name="mail" size={17} />
        </div>
        <div>
          <div className="text-[14px] font-bold text-ink tracking-[-.2px]">Google</div>
          <div className="text-[11px] text-ink-3 mt-px font-medium">
            OAuth 2.0 · Pull-only · 3 escopos
          </div>
        </div>
        <div className="ml-auto">
          {status === null ? (
            <Badge variant="gray">Carregando…</Badge>
          ) : connected ? (
            <Badge variant="green">Conectado como {status.email}</Badge>
          ) : (
            <Badge variant="gray">Não conectado</Badge>
          )}
        </div>
      </div>

      {/* Subtexto: token expiry */}
      {connected && expiry && (
        <div className="text-[11px] text-ink-3 font-medium">{expiry}</div>
      )}

      {/* Toast inline (some sozinho) */}
      {toast && (
        <div
          className={cn(
            "text-[11.5px] font-semibold px-3 py-2 rounded border",
            toast.kind === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          )}
          role="status"
        >
          {toast.msg}
        </div>
      )}

      {/* Estado: testando */}
      {test.phase === "loading" && (
        <div className="bg-bg border border-hair rounded-md px-3 py-2 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11.5px] text-ink-2 font-semibold">Buscando contatos…</span>
        </div>
      )}

      {/* Estado: teste OK — mini-tabela densa */}
      {test.phase === "ok" && (
        <div className="bg-bg border border-hair rounded-md overflow-hidden">
          <div className="px-3 py-1.5 text-[10.5px] font-bold text-ink-3 uppercase tracking-[.05em] border-b border-hair">
            Últimos {test.contacts.length} contatos do seu Google
          </div>
          {test.contacts.length === 0 ? (
            <div className="px-3 py-3 text-[11.5px] text-ink-3 font-medium">
              Nenhum contato encontrado.
            </div>
          ) : (
            <table className="w-full text-[11.5px] tabular">
              <tbody>
                {test.contacts.map((c, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-t border-hair",
                      i === 0 && "border-t-0"
                    )}
                  >
                    <td className="px-3 py-1.5 text-ink font-semibold w-1/2 truncate">
                      {c.name || "(sem nome)"}
                    </td>
                    <td className="px-3 py-1.5 text-ink-2 mono truncate">
                      {c.email || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Estado: erro do teste */}
      {test.phase === "err" && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[11.5px] font-semibold px-3 py-2 rounded">
          {test.msg}
        </div>
      )}

      {/* Sprint G — bloco de sincronização (só quando conectado) */}
      {connected && (
        <div className="bg-bg border border-hair rounded-md p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11.5px] font-bold text-ink-2 uppercase tracking-[.05em]">
              Contatos sincronizados
            </div>
            <div className="text-[11px] text-ink-3 font-medium mt-0.5">
              {sync.phase === "loading" ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Importando…
                </span>
              ) : sync.phase === "done" ? (
                <>
                  Última sync {relativeFromIso(sync.report.finished_at)} ·
                  {" "}{sync.report.count_imported}n / {sync.report.count_updated}u / {sync.report.count_skipped}s
                </>
              ) : lastSyncAt ? (
                <>Última sync {relativeFromIso(lastSyncAt)}</>
              ) : (
                <>Nunca sincronizado</>
              )}
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={sync.phase === "loading"}
            className="px-3 py-[7px] rounded-md bg-accent text-white border border-accent text-[11.5px] font-semibold hover:bg-accent-hover disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {sync.phase === "loading" ? "Sincronizando…" : "Sincronizar agora"}
          </button>
        </div>
      )}

      {/* Botões */}
      {!connected ? (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleConnect}
            className="px-3 py-[7px] rounded-md bg-accent text-white border border-accent text-[11.5px] font-semibold hover:bg-accent-hover transition-colors"
          >
            Conectar Google
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleTest}
            disabled={test.phase === "loading"}
            className="px-3 py-[7px] rounded-md bg-card text-ink border border-hair text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 disabled:opacity-50 transition-colors"
          >
            Testar conexão
          </button>
          <button
            onClick={handleDisconnect}
            disabled={busy}
            className="px-3 py-[7px] rounded-md bg-transparent text-err border border-transparent text-[11.5px] font-semibold hover:bg-red-50 hover:border-red-200 disabled:opacity-50 transition-colors"
          >
            {busy ? "Desconectando…" : "Desconectar"}
          </button>
        </div>
      )}
    </div>
  )
}
