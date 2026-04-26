"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

export type Tab = {
  id: string
  label: string
  icon: Parameters<typeof Icon>[0]["name"]
  notif?: boolean
}

type Props = {
  tabs: Tab[]
  defaultActive?: string
  children: (active: string) => React.ReactNode
}

export function Tabs({ tabs, defaultActive, children }: Props) {
  const [active, setActive] = useState(defaultActive ?? tabs[0].id)
  return (
    <>
      <div className="bg-card border-b border-hair flex overflow-x-auto px-5 shrink-0 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "px-[14px] py-3 text-[12.5px] font-semibold whitespace-nowrap flex items-center gap-[6px] tracking-[-.1px] transition-colors border-b-2",
              active === tab.id
                ? "text-accent border-accent"
                : "text-ink-3 border-transparent hover:text-ink-2"
            )}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
            {tab.notif && (
              <span className="text-[9px] font-extrabold bg-err text-white rounded-full px-[5px] py-px">
                !
              </span>
            )}
          </button>
        ))}
      </div>
      {children(active)}
    </>
  )
}
