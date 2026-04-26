"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import { FEED_ITEMS, AGENT_INFO } from "@/lib/chat-data"

const FILTERS = ["Todos", "Silva", "Ricardo", "Ana", "Clara"]

export function AgentFeed() {
  const [filter, setFilter] = useState("Todos")
  return (
    <div className="w-[288px] min-w-[288px] bg-card border-l border-hair flex flex-col overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-[14px] border-b border-hair shrink-0">
        <div className="flex items-center gap-[7px] text-[12.5px] font-bold text-ink tracking-[-.15px]">
          <span className="w-[6px] h-[6px] rounded-full bg-ok" />
          Feed dos Agentes
        </div>
        <button className="text-ink-3 hover:text-ink p-1 rounded transition-colors">
          <Icon name="chevron" size={14} />
        </button>
      </div>

      <div className="flex gap-[5px] px-3 py-2 border-b border-hair overflow-x-auto scrollbar-none shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-[9px] py-1 rounded-full border text-[10.5px] font-semibold whitespace-nowrap transition-colors",
              filter === f
                ? "bg-accent-soft border-indigo-200 text-accent"
                : "bg-card border-hair text-ink-2 hover:border-ink-4"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {FEED_ITEMS.map((item) => {
          const from = AGENT_INFO[item.from]
          const to = AGENT_INFO[item.to]
          return (
            <div
              key={item.id}
              className={cn(
                "px-[14px] py-[10px] border-b border-hair-2 cursor-pointer transition-colors",
                item.unread ? "bg-bg/50 border-l-2 border-l-accent" : "hover:bg-bg"
              )}
            >
              <div className="flex items-start gap-[7px]">
                <div className="w-5 h-5 rounded bg-bg border border-hair flex items-center justify-center text-[10px] shrink-0">
                  {from.emoji}
                </div>
                <span className="text-[10px] text-ink-3 mt-[3px] shrink-0">→</span>
                <div className="w-5 h-5 rounded bg-bg border border-hair flex items-center justify-center text-[10px] shrink-0">
                  {to.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-ink truncate tracking-[-.1px]">
                    {from.name} → {to.name}
                  </div>
                  <div className="text-[10.5px] text-ink-2 mt-[2px] leading-[1.4] font-medium">
                    {item.msg}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center text-[9.5px] font-bold mt-1 px-[6px] py-px rounded border",
                      item.status === "done"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {item.statusText}
                  </span>
                </div>
                <div className="text-[10px] text-ink-3 font-medium shrink-0">{item.time}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
