import { cn } from "@/lib/cn"

type Variant = "neutral" | "green" | "red" | "amber" | "gray" | "indigo"

const CLS: Record<Variant, string> = {
  neutral: "bg-hair-2 text-ink-2 border-hair",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-hair-2 text-ink-2 border-hair",
  indigo: "bg-accent-soft text-accent border-indigo-200",
}

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: Variant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded border",
        CLS[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
