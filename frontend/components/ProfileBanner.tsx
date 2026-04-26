type Stat = { value: string | number; label: string }

type Props = {
  initials: string
  name: string
  role: string
  tags?: string[]
  stats?: Stat[]
}

export function ProfileBanner({ initials, name, role, tags, stats }: Props) {
  return (
    <div className="bg-card px-6 py-[18px] border-b border-hair flex items-center gap-4 shrink-0">
      <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center text-[20px] font-bold tracking-[-.3px]">
        {initials}
      </div>
      <div className="flex-1">
        <div className="text-[17px] font-bold text-ink tracking-[-.4px]">{name}</div>
        <div className="text-xs text-ink-2 mt-0.5 font-medium">{role}</div>
        {tags && (
          <div className="flex gap-[5px] mt-[6px] flex-wrap">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-hair-2 text-ink-2 border border-hair"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      {stats && (
        <div className="flex border border-hair rounded-md overflow-hidden bg-card">
          {stats.map((s, i) => (
            <div
              key={i}
              className="px-[18px] py-[10px] text-center border-r border-hair last:border-r-0"
            >
              <div className="text-[17px] font-bold text-accent leading-none tabular">{s.value}</div>
              <div className="text-[10px] font-semibold text-ink-3 mt-[3px] uppercase tracking-[.04em] whitespace-nowrap">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
