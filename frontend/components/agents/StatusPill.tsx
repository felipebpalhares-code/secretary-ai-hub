import { cn } from "@/lib/cn"
import type { AgentStatus } from "@/lib/agents-api"

const TONES: Record<AgentStatus, { cls: string; label: string }> = {
  draft:  { cls: "bg-bg-subtle      text-text-secondary border-default", label: "Rascunho" },
  active: { cls: "bg-success-subtle text-success         border-default", label: "Ativo"    },
  paused: { cls: "bg-warning-subtle text-warning         border-default", label: "Pausado"  },
}

export function StatusPill({ status, className }: { status: AgentStatus; className?: string }) {
  const t = TONES[status]
  return (
    <span
      className={cn(
        "inline-flex items-center text-tiny font-medium px-2 py-0.5 rounded-sm border",
        t.cls,
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "active" && "bg-success",
          status === "paused" && "bg-warning",
          status === "draft"  && "bg-text-tertiary",
        )}
      />
      {t.label}
    </span>
  )
}
