"use client"
import type { ReactNode } from "react"
import { Icon } from "@/components/Icon"

/**
 * Empty state Apple-style do Design System.
 * Container generoso, ícone 64px tertiary, título text-subtitle, subtítulo
 * text-body text-text-secondary, ação primária centralizada.
 */
export function EmptyState({
  icon = "file",
  title,
  subtitle,
  action,
  className = "",
}: {
  icon?: Parameters<typeof Icon>[0]["name"]
  title: string
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="text-text-tertiary">
        <Icon name={icon} size={64} strokeWidth={1.5} />
      </div>
      <div className="text-subtitle text-text-primary mt-4">{title}</div>
      {subtitle && (
        <div className="text-body text-text-secondary mt-2 max-w-md leading-relaxed">
          {subtitle}
        </div>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
