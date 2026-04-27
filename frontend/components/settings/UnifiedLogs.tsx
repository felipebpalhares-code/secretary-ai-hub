"use client"
import { useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { getLogs, type MessageLog } from "@/lib/api"

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "discord", label: "Discord" },
] as const

const CHANNEL_BADGE: Record<string, { abbr: string; cls: string }> = {
  whatsapp: { abbr: "WA", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  telegram: { abbr: "TG", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  discord: { abbr: "DC", cls: "bg-purple-50 text-purple-700 border-purple-200" },
}

const FLAG_BADGE: Record<string, string> = {
  urgent: "bg-red-50 text-red-700 border-red-200",
  briefing: "bg-accent-soft text-accent border-indigo-200",
  alert: "bg-amber-50 text-amber-700 border-amber-200",
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const today = new Date()
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  if (sameDay) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function UnifiedLogs() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all")
  const [logs, setLogs] = useState<MessageLog[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLogs(null)
    setError(null)
    const params = filter === "all" ? { limit: 50 } : { channel: filter, limit: 50 }
    getLogs(params)
      .then((data) => {
        if (mounted) setLogs(data)
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "Falha ao carregar logs")
      })
    return () => {
      mounted = false
    }
  }, [filter])

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
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={
                  filter === f.id
                    ? "bg-accent-soft border border-indigo-200 text-accent px-[10px] py-1 rounded-full text-[11px] font-semibold"
                    : "bg-card border border-hair text-ink-2 px-[10px] py-1 rounded-full text-[11px] font-semibold hover:border-ink-4 transition-colors"
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="px-[18px] py-8 text-center text-[12px] font-semibold text-err">{error}</div>
        ) : logs === null ? (
          <div className="px-[18px] py-8 text-center text-[12px] text-ink-3 font-medium">
            Carregando…
          </div>
        ) : logs.length === 0 ? (
          <div className="px-[18px] py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-bg border border-hair flex items-center justify-center text-ink-3 mx-auto mb-2">
              <Icon name="chat" size={16} />
            </div>
            <div className="text-[12.5px] font-bold text-ink mb-1">Sem mensagens ainda</div>
            <div className="text-[11px] text-ink-3 font-medium">
              Conforme conversas acontecerem nos canais conectados, elas aparecem aqui.
            </div>
          </div>
        ) : (
          logs.map((log) => {
            const badge = CHANNEL_BADGE[log.channel] ?? {
              abbr: log.channel.slice(0, 2).toUpperCase(),
              cls: "bg-hair-2 text-ink-2 border-hair",
            }
            const from = log.direction === "in" ? log.sender : log.agent || "Hub"
            const to = log.direction === "in" ? log.agent || "Hub" : log.sender
            const flagCls = log.flag ? FLAG_BADGE[log.flag] : null

            return (
              <div
                key={log.id}
                className="flex items-start gap-[10px] px-[18px] py-[10px] border-b border-hair-2 last:border-b-0 hover:bg-bg text-[11.5px] cursor-pointer transition-colors"
              >
                <div
                  className={`text-[10px] font-bold px-[6px] py-px rounded border w-[32px] text-center shrink-0 ${badge.cls}`}
                >
                  {badge.abbr}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-[6px] items-center flex-wrap">
                    <span className="font-bold text-ink">{from}</span>
                    <span className="text-[10.5px] text-ink-3">→</span>
                    <span className="font-bold text-ink">{to}</span>
                    {flagCls && (
                      <span className={`text-[9.5px] font-bold px-[6px] py-px rounded border ${flagCls}`}>
                        {log.flag}
                      </span>
                    )}
                  </div>
                  <div className="text-ink-2 mt-[2px] leading-[1.5] font-medium truncate">
                    {log.body}
                  </div>
                </div>
                <div className="text-[10px] text-ink-3 shrink-0 w-[52px] text-right font-medium">
                  {formatTime(log.created_at)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
