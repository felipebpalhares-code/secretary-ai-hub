"use client"
import { useEffect, useState } from "react"
import { ChannelCard } from "@/components/settings/ChannelCard"
import { Icon } from "@/components/Icon"
import { whatsappStatus, whatsappQrcode, whatsappDisconnect } from "@/lib/api"

type ConnState = "open" | "close" | "connecting" | "qrcode" | "unknown"

function normalize(state: unknown): ConnState {
  if (typeof state === "string") {
    const s = state.toLowerCase()
    if (s === "open" || s === "close" || s === "connecting" || s === "qrcode") return s
  }
  if (state && typeof state === "object") {
    const obj = state as Record<string, unknown>
    const inner = obj.state ?? obj.instance ?? (obj.instance as Record<string, unknown>)?.state
    if (inner) return normalize(inner)
  }
  return "unknown"
}

const STATE_LABEL: Record<ConnState, string> = {
  open: "Conectado",
  close: "Desconectado",
  connecting: "Conectando…",
  qrcode: "Aguardando QR",
  unknown: "Indisponível",
}

const STATE_TO_CARD: Record<ConnState, "on" | "off" | "idle"> = {
  open: "on",
  close: "off",
  connecting: "idle",
  qrcode: "idle",
  unknown: "off",
}

/** ChannelCard que conecta no backend pra mostrar status real do WhatsApp. */
export function WhatsAppChannelCard() {
  const [state, setState] = useState<ConnState>("unknown")

  useEffect(() => {
    let mounted = true
    whatsappStatus()
      .then((res) => {
        if (mounted) setState(normalize(res.state))
      })
      .catch(() => {
        if (mounted) setState("unknown")
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <ChannelCard
      name="WhatsApp"
      sub="Canal principal · Evolution API"
      iconName="chat"
      status={STATE_TO_CARD[state]}
      statusLabel={STATE_LABEL[state]}
      phone={state === "open" ? "Sessão ativa" : "Sem sessão"}
      phoneMuted={state !== "open"}
      stats={[
        { v: "—", l: "Msgs hoje" },
        { v: "—", l: "Alertas" },
        { v: "—", l: "Agentes" },
      ]}
      topColor="ok"
      primaryLabel={state === "open" ? "Configurar" : "Conectar"}
      secondaryLabel="Logs"
    />
  )
}

/** Painel à esquerda: status real + QR quando aplicável. */
export function WhatsAppQrPanel() {
  const [state, setState] = useState<ConnState>("unknown")
  const [qr, setQr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setError(null)
    try {
      const status = await whatsappStatus()
      const next = normalize(status.state)
      setState(next)
      if (next !== "open") {
        try {
          const code = await whatsappQrcode()
          // O Evolution costuma retornar { base64, code, ... } ou string. Tentamos achar a base64.
          const b64 =
            (code && typeof code === "object" && "base64" in code
              ? (code as { base64?: string }).base64
              : null) ||
            (code && typeof code === "object" && "qrcode" in code
              ? (code as { qrcode?: string }).qrcode
              : null)
          setQr(b64 ?? null)
        } catch {
          setQr(null)
        }
      } else {
        setQr(null)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao consultar Evolution")
    }
  }

  useEffect(() => {
    void refresh()
    const id = setInterval(refresh, 8000)
    return () => clearInterval(id)
  }, [])

  async function handleDisconnect() {
    setBusy(true)
    try {
      await whatsappDisconnect()
      await refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao desconectar")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-5 border-r border-hair flex flex-col gap-3">
      <div className="text-[11.5px] font-bold text-ink-2 uppercase tracking-[.05em]">
        Conexão Evolution
      </div>

      <div className="bg-bg border border-hair rounded-md p-4 flex flex-col items-center gap-3">
        {state === "open" ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-ok">
              <Icon name="check" size={28} />
            </div>
            <div className="text-[11.5px] text-ok font-bold">Conectado</div>
            <button
              onClick={handleDisconnect}
              disabled={busy}
              className="w-full px-2 py-[7px] rounded-md border border-red-200 bg-red-50 text-err text-[11.5px] font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {busy ? "Desconectando…" : "Desconectar sessão"}
            </button>
          </>
        ) : qr ? (
          <>
            <img
              src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`}
              alt="QR Code WhatsApp"
              className="w-40 h-40 border border-hair rounded-md"
            />
            <div className="text-[11.5px] text-amber-700 font-bold">Escaneie no WhatsApp</div>
            <div className="text-[10.5px] text-ink-3 font-medium text-center leading-relaxed">
              WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-bg border-2 border-hair flex items-center justify-center text-ink-3">
              <Icon name="chat" size={28} />
            </div>
            <div className="text-[11.5px] text-ink-3 font-bold">{STATE_LABEL[state]}</div>
            <div className="text-[10.5px] text-ink-3 font-medium text-center leading-relaxed">
              Confirme se o container Evolution está rodando (`make up-wa`).
            </div>
            <button
              onClick={refresh}
              className="w-full px-2 py-[7px] rounded-md border border-hair bg-card text-ink text-[11.5px] font-semibold hover:border-ink-4 transition-colors"
            >
              Verificar agora
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[11px] font-semibold px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="text-[10.5px] text-ink-2 leading-[1.6] font-medium">
        <strong className="text-ink">Stack</strong>
        <br />• Evolution API em <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10px] text-ink-2">evolution:8080</code>
        <br />• Webhook <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10px] text-ink-2">/api/connections/webhooks/whatsapp</code>
        <br />• Status em tempo real (poll 8s)
      </div>
    </div>
  )
}
