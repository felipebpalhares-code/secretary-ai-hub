"use client"
import { useState } from "react"
import { Icon } from "@/components/Icon"
import { AgentCard } from "@/components/agents/AgentCard"
import { TrainingPanel } from "@/components/agents/TrainingPanel"
import { ChatModal } from "@/components/agents/ChatModal"
import { AGENTS, type Agent } from "@/lib/agents-data"

export function AgentsHub() {
  const [trainAgent, setTrainAgent] = useState<Agent | null>(null)
  const [chatAgent, setChatAgent] = useState<Agent | null>(null)

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-3">
          <Sum icon="bot" value={8} label="Agentes criados" />
          <Sum icon="check" value={6} label="Online agora" />
          <Sum icon="alert" value={3} label="Alertas hoje" />
          <Sum icon="file" value={28} label="Docs treinados" />
        </div>

        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
            Equipe de agentes
          </div>
          <div className="grid grid-cols-2 gap-3">
            {AGENTS.map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                onChat={() => setChatAgent(a)}
                onTrain={() => setTrainAgent(a)}
              />
            ))}
          </div>
        </div>
      </div>

      <TrainingPanel
        agent={trainAgent}
        open={!!trainAgent}
        onClose={() => setTrainAgent(null)}
      />
      <ChatModal agent={chatAgent} open={!!chatAgent} onClose={() => setChatAgent(null)} />
    </>
  )
}

function Sum({
  icon,
  value,
  label,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  value: number
  label: string
}) {
  return (
    <div className="bg-card border border-hair rounded-lg p-[14px_16px] flex items-center gap-3">
      <div className="w-[34px] h-[34px] rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
        <Icon name={icon} size={16} />
      </div>
      <div>
        <div className="text-[19px] font-bold text-ink leading-none tabular">{value}</div>
        <div className="text-[11px] text-ink-3 font-semibold mt-[3px]">{label}</div>
      </div>
    </div>
  )
}
