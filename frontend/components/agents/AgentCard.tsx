import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import type { Agent, AgentTone, AgentLevel } from "@/lib/agents-data"

const TONE_BORDER: Record<AgentTone, string> = {
  silva: "border-l-purple-600",
  ricardo: "border-l-ok",
  eng: "border-l-orange-500",
  ana: "border-l-pink-500",
  diretor: "border-l-blue-600",
  marcos: "border-l-warn",
  clara: "border-l-accent",
  carlos: "border-l-err",
}

const SPEC_CLS: Record<AgentTone, string> = {
  silva: "bg-purple-50 text-purple-700 border-purple-200",
  ricardo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  eng: "bg-orange-50 text-orange-700 border-orange-200",
  ana: "bg-pink-50 text-pink-700 border-pink-200",
  diretor: "bg-blue-50 text-blue-700 border-blue-200",
  marcos: "bg-amber-50 text-amber-700 border-amber-200",
  clara: "bg-accent-soft text-accent border-indigo-200",
  carlos: "bg-red-50 text-red-700 border-red-200",
}

const LEVEL_CLS: Record<AgentLevel, string> = {
  master: "bg-amber-50 text-amber-800 border-amber-200",
  expert: "bg-hair-2 text-ink border-hair",
  senior: "bg-emerald-50 text-emerald-700 border-emerald-200",
  basic: "bg-bg text-ink-3 border-hair",
}

const LEVEL_LABEL: Record<AgentLevel, string> = {
  master: "Master",
  expert: "Expert",
  senior: "Sênior",
  basic: "Básico",
}

export function AgentCard({
  agent,
  onChat,
  onTrain,
}: {
  agent: Agent
  onChat: () => void
  onTrain: () => void
}) {
  return (
    <div
      className={cn(
        "bg-card border border-hair rounded-lg p-4 flex flex-col gap-3 transition-all border-l-[3px] hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)]",
        TONE_BORDER[agent.tone]
      )}
    >
      <div className="flex items-start gap-[11px]">
        <div className="w-10 h-10 rounded-md bg-bg border border-hair flex items-center justify-center text-[17px] shrink-0">
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-ink tracking-[-.25px]">{agent.name}</div>
          <div className="text-[11.5px] text-ink-2 mt-px font-medium">{agent.title}</div>
          <div className="flex items-center gap-[5px] mt-[6px] flex-wrap">
            <span
              className={cn(
                "text-[10.5px] font-semibold px-2 py-0.5 rounded border",
                SPEC_CLS[agent.tone]
              )}
            >
              {agent.specialty}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-[3px] text-[10.5px] font-bold px-2 py-0.5 rounded border",
                LEVEL_CLS[agent.level]
              )}
            >
              {LEVEL_LABEL[agent.level]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[6px]">
        <Stat value={agent.docs} label="Docs" />
        <Stat value={agent.books} label="Livros" />
        <Stat value={agent.instructions} label="Instruções" />
      </div>

      <div className="text-[11px] text-ink-3 flex items-center gap-[5px] font-medium">
        <span className={cn("w-[6px] h-[6px] rounded-full", agent.online ? "bg-ok" : "bg-ink-4")} />
        {agent.activity}
      </div>

      <div className="grid grid-cols-2 gap-[6px]">
        <button
          onClick={onChat}
          className="px-2 py-[7px] rounded-md bg-accent text-white text-[12px] font-semibold border border-accent hover:bg-accent-hover flex items-center justify-center gap-[5px] transition-colors"
        >
          <Icon name="chat" size={13} />
          Conversar
        </button>
        <button
          onClick={onTrain}
          className="px-2 py-[7px] rounded-md bg-card text-ink text-[12px] font-semibold border border-hair hover:bg-bg hover:border-ink-4 flex items-center justify-center gap-[5px] transition-colors"
        >
          <Icon name="target" size={13} />
          Treinar
        </button>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-bg border border-hair rounded-md py-[7px] text-center">
      <div className="text-[14px] font-bold text-ink tabular">{value}</div>
      <div className="text-[9.5px] text-ink-3 font-semibold mt-px uppercase tracking-[.04em]">
        {label}
      </div>
    </div>
  )
}
