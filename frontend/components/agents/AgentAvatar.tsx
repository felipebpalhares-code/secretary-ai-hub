import { cn } from "@/lib/cn"

/** Avatar circular com iniciais — derivadas do nome do agente. */
export function AgentAvatar({
  name,
  size = 40,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?"

  return (
    <div
      className={cn(
        "rounded-full bg-brand-subtle text-brand font-medium flex items-center justify-center select-none shrink-0",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, Math.round(size * 0.4)),
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
