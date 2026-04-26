export function DataList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-[6px]">{children}</div>
}

export function DataItem({
  main,
  sub,
  right,
}: {
  main: React.ReactNode
  sub?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-[10px_14px] bg-bg border border-hair rounded-md hover:border-ink-4 transition-colors">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink tracking-[-.1px]">{main}</div>
        {sub && <div className="text-[11px] text-ink-3 font-medium">{sub}</div>}
      </div>
      {right && <div className="flex items-center gap-[6px] shrink-0">{right}</div>}
    </div>
  )
}
