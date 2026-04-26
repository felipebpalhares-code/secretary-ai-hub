"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { CONVERSATIONS } from "@/lib/chat-data"

const SCENARIOS = [
  { id: "dia", icon: "globe" as const, label: "Como está meu dia?" },
  { id: "juridico", icon: "shield" as const, label: "Status jurídico" },
  { id: "obras", icon: "building" as const, label: "Status das obras" },
  { id: "fin", icon: "money" as const, label: "Saúde financeira" },
]

export function ConvSidebar({
  active,
  onSelect,
  onMeeting,
}: {
  active: string
  onSelect: (id: string) => void
  onMeeting: () => void
}) {
  const [mode, setMode] = useState<"livre" | "reuniao" | "briefing">("livre")

  return (
    <div className="w-[276px] min-w-[276px] bg-card border-r border-hair flex flex-col overflow-hidden shrink-0">
      <div className="px-4 pt-[14px] pb-3 border-b border-hair shrink-0">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="text-[14px] font-bold text-ink tracking-[-.25px]">Conversas</div>
          <button
            onClick={onMeeting}
            className="inline-flex items-center gap-[5px] px-[11px] py-[5px] bg-accent text-white text-[11.5px] font-semibold rounded-md hover:bg-accent-hover transition-colors"
          >
            <Icon name="plus" size={12} />
            Reunião
          </button>
        </div>
        <div className="flex items-center gap-[7px] bg-bg border border-hair rounded-md px-[10px] py-[6px]">
          <Icon name="search" size={13} className="text-ink-3" />
          <input
            placeholder="Buscar..."
            className="flex-1 bg-transparent outline-none text-[12px] text-ink placeholder:text-ink-3"
          />
        </div>
      </div>

      <div className="px-3 py-[10px] border-b border-hair shrink-0">
        <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[7px]">
          Ações rápidas
        </div>
        <div className="flex flex-col gap-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className="flex items-center gap-2 px-[10px] py-[7px] rounded-md border border-hair bg-card text-[12px] font-semibold text-ink-2 hover:bg-bg hover:border-ink-4 hover:text-ink text-left transition-colors"
            >
              <Icon name={s.icon} size={13} className="text-ink-3" />
              {s.label}
            </button>
          ))}
          <button className="flex items-center gap-2 px-[10px] py-[7px] rounded-md border border-red-200 bg-card text-[12px] font-semibold text-err hover:bg-red-50 text-left transition-colors">
            <Icon name="alert" size={13} />
            Modo urgência
          </button>
        </div>
      </div>

      <div className="flex gap-[3px] px-3 py-[10px] border-b border-hair shrink-0">
        {(["livre", "reuniao", "briefing"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 px-1 py-[6px] rounded-md border text-[11px] font-semibold capitalize transition-colors",
              mode === m
                ? "bg-accent border-accent text-white"
                : "bg-card border-hair text-ink-2 hover:bg-bg hover:border-ink-4"
            )}
          >
            {m === "reuniao" ? "Reunião" : m}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {CONVERSATIONS.map((group) => (
          <div key={group.period}>
            <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.07em] px-4 pt-[10px] pb-1">
              {group.period}
            </div>
            {group.items.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "flex items-start gap-[10px] px-4 py-[10px] cursor-pointer border-b border-hair-2 transition-colors relative",
                  active === c.id
                    ? "bg-accent-soft before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-accent"
                    : "hover:bg-bg"
                )}
              >
                <div className="w-8 h-8 rounded-md bg-bg border border-hair flex items-center justify-center text-[14px] shrink-0">
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-ink truncate tracking-[-.15px]">{c.title}</div>
                  <div className="text-[11px] text-ink-3 truncate mt-px font-medium">{c.preview}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="text-[10px] text-ink-3 font-medium">{c.time}</div>
                  {c.badge && (
                    <span
                      className={cn(
                        "text-[9.5px] font-bold px-[6px] py-px rounded-full text-white min-w-[18px] text-center",
                        c.badge.variant === "alert"
                          ? "bg-err"
                          : c.badge.variant === "amber"
                            ? "bg-warn"
                            : "bg-accent"
                      )}
                    >
                      {c.badge.count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
