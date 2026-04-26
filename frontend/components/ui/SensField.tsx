"use client"
import { useState } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"

export function SensField({
  masked,
  real,
  suffix,
}: {
  masked: string
  real?: string
  suffix?: React.ReactNode
}) {
  const [shown, setShown] = useState(false)
  const value = shown && real ? real : masked
  return (
    <div className="flex items-center gap-[6px] flex-wrap">
      <span className={cn("mono text-[12px] font-semibold", shown ? "text-accent" : "text-ink")}>
        {value}
      </span>
      {real && (
        <button
          onClick={() => setShown((s) => !s)}
          className="text-ink-3 hover:text-accent p-0.5 rounded transition-colors"
        >
          <Icon name="eye" size={13} />
        </button>
      )}
      {suffix}
    </div>
  )
}
