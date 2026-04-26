import { cn } from "@/lib/cn"

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        "bg-card border border-hair rounded-lg transition-colors",
        hover && "hover:border-ink-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
      {children}
    </div>
  )
}
