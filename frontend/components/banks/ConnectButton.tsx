"use client"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { usePluggyConnect } from "@/lib/usePluggyConnect"
import type { BackendStatus } from "@/lib/useBackendStatus"

export function ConnectButton({
  backend,
  onConnected,
  variant = "primary",
}: {
  backend: BackendStatus
  onConnected?: () => void
  variant?: "primary" | "ghost"
}) {
  const { open, loading } = usePluggyConnect()

  const click = () => {
    open({
      includeSandbox: true,
      onSuccess: () => onConnected?.(),
    })
  }

  if (backend === "offline") {
    return (
      <button
        disabled
        title="Backend FastAPI não está rodando · execute make up"
        className="inline-flex items-center gap-[6px] px-[13px] py-[7px] rounded-md border border-hair bg-card text-ink-3 text-[12.5px] font-semibold cursor-not-allowed opacity-60"
      >
        <Icon name="plus" size={13} />
        Conectar conta · backend offline
      </button>
    )
  }

  return (
    <button
      onClick={click}
      disabled={loading || backend === "checking"}
      className={cn(
        "inline-flex items-center gap-[6px] px-[13px] py-[7px] rounded-md text-[12.5px] font-semibold transition-colors disabled:opacity-50",
        variant === "primary"
          ? "bg-accent text-white border border-accent hover:bg-accent-hover"
          : "bg-card text-ink border border-hair hover:bg-bg hover:border-ink-4"
      )}
    >
      {loading ? (
        <>
          <span className="w-[10px] h-[10px] rounded-full border-2 border-current border-r-transparent animate-spin" />
          Abrindo Pluggy...
        </>
      ) : (
        <>
          <Icon name="plus" size={13} />
          Conectar conta
        </>
      )}
    </button>
  )
}

export function BackendBanner({ status }: { status: BackendStatus }) {
  if (status === "online") return null
  if (status === "checking") return null

  return (
    <div className="bg-card border border-hair border-l-[3px] border-l-warn rounded-md px-4 py-3 flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-amber-50 text-warn border border-amber-200 flex items-center justify-center shrink-0">
        <Icon name="alert" size={13} />
      </div>
      <div className="flex-1">
        <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
          Backend offline · mostrando dados de exemplo
        </div>
        <div className="text-[11px] text-ink-2 font-medium mt-px leading-[1.5]">
          Inicie o backend pra conectar bancos reais via Pluggy:{" "}
          <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10.5px]">
            cd secretary-ai && make up
          </code>
          . Depois configure <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10.5px]">PLUGGY_CLIENT_ID</code>{" "}
          e <code className="bg-bg border border-hair px-[5px] py-px rounded mono text-[10.5px]">PLUGGY_CLIENT_SECRET</code> no .env.
        </div>
      </div>
    </div>
  )
}
