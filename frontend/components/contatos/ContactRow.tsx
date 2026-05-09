"use client"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import type { Contact, Category } from "@/lib/contacts-types"
import { avatarTone, displayLabel, initialsOf, categoryById, formatPhone, contactCompany } from "./utils"

export function ContactRow({
  contact,
  categories,
  selected,
  onClick,
}: {
  contact: Contact
  categories: Category[]
  selected: boolean
  onClick: () => void
}) {
  const cat = categoryById(categories, contact.category_id)
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "text-left w-full grid grid-cols-[36px_1.4fr_1.2fr_1fr_120px_36px] items-center gap-3 px-3 py-2 border-b border-hair-2 hover:bg-bg-subtle transition-colors",
        selected && "bg-accent-soft"
      )}
    >
      {contact.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={contact.photo_url} alt="" className="w-7 h-7 rounded-full object-cover" />
      ) : (
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white",
            avatarTone(contact.id)
          )}
        >
          {initialsOf(contact)}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink truncate">{displayLabel(contact)}</div>
        <div className="text-[10.5px] text-ink-3 font-medium truncate">
          {[contact.role, contactCompany(contact)].filter(Boolean).join(" · ") || "—"}
        </div>
      </div>
      <div className="text-[11.5px] text-ink-2 font-medium truncate mono">
        {contact.email || "—"}
      </div>
      <div className="text-[11.5px] text-ink-2 font-medium truncate mono">
        {contact.phone ? formatPhone(contact.phone) : "—"}
      </div>
      <div className="text-[10.5px] font-semibold truncate">
        {cat ? (
          <span
            className="px-[7px] py-0.5 rounded border bg-bg-subtle text-ink-2 border-hair"
            style={
              cat.color
                ? { borderColor: cat.color, color: cat.color, background: `${cat.color}14` }
                : undefined
            }
          >
            {cat.name}
          </span>
        ) : (
          <span className="text-ink-3">Sem categoria</span>
        )}
      </div>
      <div className="flex items-center justify-end text-ink-3">
        <Icon name="chevron" size={13} />
      </div>
    </button>
  )
}
