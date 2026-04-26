import { Icon } from "./Icon"

type Props = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-hair bg-card shrink-0">
      <div>
        <div className="text-[18px] font-bold text-ink tracking-[-.4px] leading-none">{title}</div>
        {subtitle && <div className="text-xs text-ink-3 mt-[3px] font-medium">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-[6px]">{actions}</div>}
    </div>
  )
}

export function IconButton({
  name,
  dot,
  onClick,
}: {
  name: Parameters<typeof Icon>[0]["name"]
  dot?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-[7px] border border-hair bg-card text-ink-2 hover:bg-bg hover:border-ink-4 flex items-center justify-center relative transition-colors"
    >
      <Icon name={name} size={14} />
      {dot && (
        <span className="absolute top-[6px] right-[6px] w-[6px] h-[6px] rounded-full bg-err border-[1.5px] border-card" />
      )}
    </button>
  )
}

type BtnProps = {
  children: React.ReactNode
  variant?: "default" | "primary"
  icon?: Parameters<typeof Icon>[0]["name"]
  onClick?: () => void
}

export function Button({ children, variant = "default", icon, onClick }: BtnProps) {
  return (
    <button
      onClick={onClick}
      className={
        variant === "primary"
          ? "inline-flex items-center gap-[6px] px-[13px] py-[7px] rounded-[7px] text-[12.5px] font-semibold tracking-[-.1px] bg-accent text-white border border-accent hover:bg-accent-hover transition-colors"
          : "inline-flex items-center gap-[6px] px-[13px] py-[7px] rounded-[7px] text-[12.5px] font-semibold tracking-[-.1px] border border-hair bg-card text-ink hover:bg-bg hover:border-ink-4 transition-colors"
      }
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  )
}
