"use client"
import { useState } from "react"
import { TopBar, IconButton, Button } from "@/components/TopBar"
import { Icon } from "@/components/Icon"
import { BancosHub } from "./BancosHub"
import { ConnectButton, BackendBanner } from "@/components/banks/ConnectButton"
import { useBackendStatus } from "@/lib/useBackendStatus"
import { banksSync } from "@/lib/api"

export function BancosShell() {
  const status = useBackendStatus()
  const [syncing, setSyncing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSync = async () => {
    if (status !== "online") return
    setSyncing(true)
    try {
      await banksSync()
      setRefreshKey((k) => k + 1)
    } catch (e) {
      console.error("Sync error:", e)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <TopBar
        title="Bancos"
        subtitle="Open Finance Brasil · Pluggy · 10 contas conectadas"
        actions={
          <>
            <IconButton name="search" />
            <button
              onClick={handleSync}
              disabled={status !== "online" || syncing}
              className="inline-flex items-center gap-[6px] px-[13px] py-[7px] rounded-md border border-hair bg-card text-[12.5px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <span className="w-[10px] h-[10px] rounded-full border-2 border-current border-r-transparent animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Icon name="settings" size={13} />
                  Sincronizar
                </>
              )}
            </button>
            <ConnectButton backend={status} onConnected={() => setRefreshKey((k) => k + 1)} />
            <BackendStatusPill status={status} />
          </>
        }
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {status === "offline" && (
          <div className="px-6 pt-4">
            <BackendBanner status={status} />
          </div>
        )}
        <BancosHub key={refreshKey} />
      </div>
    </>
  )
}

function BackendStatusPill({ status }: { status: ReturnType<typeof useBackendStatus> }) {
  const cls =
    status === "online"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "checking"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200"
  const label =
    status === "online" ? "Backend online" : status === "checking" ? "Verificando..." : "Backend offline"
  const dot =
    status === "online" ? "bg-ok" : status === "checking" ? "bg-warn animate-pulse" : "bg-err"

  return (
    <span
      className={`inline-flex items-center gap-1 border text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full ${cls}`}
    >
      <span className={`w-[6px] h-[6px] rounded-full ${dot}`} />
      {label}
    </span>
  )
}
