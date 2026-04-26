import { Icon } from "../Icon"

type Props = {
  title: string
  subtitle: string
  note?: string
}

export function ComingSoon({ title, subtitle, note }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-xl bg-card border border-hair text-ink-2 flex items-center justify-center mx-auto mb-4">
          <Icon name="settings" size={22} />
        </div>
        <h2 className="text-[20px] font-bold text-ink tracking-[-.4px]">{title}</h2>
        <p className="text-sm text-ink-2 mt-2 font-medium leading-relaxed">{subtitle}</p>
        {note && (
          <div className="mt-5 px-4 py-3 bg-accent-soft border border-indigo-200 rounded-lg text-xs text-accent font-medium">
            {note}
          </div>
        )}
      </div>
    </div>
  )
}
