export function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2 py-[7px] border-b border-hair-2 last:border-b-0 last:pb-0 text-[12.5px]">
      <span className="w-[138px] shrink-0 text-[11px] font-semibold text-ink-3 pt-px">{label}</span>
      <span className="flex-1 font-semibold text-ink leading-[1.4] tracking-[-.1px]">{children}</span>
    </div>
  )
}
