import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import type { Contact } from "@/lib/contacts-data"

const AV_TONE: Record<Contact["avatarTone"], string> = {
  slate: "bg-slate-700",
  slate2: "bg-slate-600",
  slate3: "bg-slate-500",
  slate4: "bg-slate-400",
  indigo: "bg-indigo-600",
  indigo2: "bg-indigo-700",
  emerald: "bg-emerald-600",
  zinc: "bg-zinc-600",
  zinc2: "bg-zinc-700",
}

const TAG_CLS = {
  neutral: "bg-hair-2 text-ink-2 border-hair",
  indigo: "bg-accent-soft text-accent border-indigo-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  gray: "bg-hair-2 text-ink-2 border-hair",
}

export function ContactCard({
  contact,
  selected,
  onClick,
}: {
  contact: Contact
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg p-3 cursor-pointer flex gap-3 items-center transition-all",
        selected
          ? "border-accent bg-accent-soft ring-4 ring-indigo-600/10"
          : "border-hair hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)]"
      )}
    >
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white tracking-[-.2px]",
            AV_TONE[contact.avatarTone]
          )}
        >
          {contact.initials}
        </div>
        <span
          className={cn(
            "absolute -bottom-px -right-px w-[11px] h-[11px] rounded-full border-2",
            selected ? "border-accent-soft" : "border-card",
            contact.online ? "bg-ok" : "bg-ink-4"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-ink tracking-[-.2px] flex items-center gap-1">
          {contact.name}
          {contact.starred && <span className="text-warn text-[10px]">★</span>}
        </div>
        <div className="text-[11.5px] text-ink-2 mt-0.5 font-medium truncate">{contact.role}</div>
        <div className="flex gap-1 mt-[5px] flex-wrap">
          {contact.tags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                "text-[10px] font-semibold px-[7px] py-0.5 rounded border",
                TAG_CLS[tag.variant]
              )}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <div className="text-[10.5px] text-ink-3 mt-[5px] font-medium">{contact.lastActivity}</div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button className="w-7 h-7 rounded-md border border-hair bg-card text-ink-2 hover:border-ink-4 hover:text-ink flex items-center justify-center transition-colors">
          <Icon name="chat" size={13} />
        </button>
        <button className="w-7 h-7 rounded-md border border-hair bg-card text-ink-2 hover:border-ink-4 hover:text-ink flex items-center justify-center transition-colors">
          <Icon name="mail" size={13} />
        </button>
      </div>
    </div>
  )
}
