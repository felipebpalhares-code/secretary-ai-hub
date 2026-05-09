"use client"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import type { Contact, Category } from "@/lib/contacts-types"
import { avatarTone, displayLabel, initialsOf, categoryById, contactCompany } from "./utils"

export function ContactCard({
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
        "text-left w-full bg-card border rounded-lg p-3 flex gap-3 items-center transition-all",
        selected
          ? "border-accent bg-accent-soft ring-4 ring-indigo-600/10"
          : "border-hair hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)]"
      )}
    >
      <div className="relative shrink-0">
        {contact.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contact.photo_url}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white tracking-[-.2px]",
              avatarTone(contact.id)
            )}
          >
            {initialsOf(contact)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-ink tracking-[-.2px] flex items-center gap-1 truncate">
          {displayLabel(contact)}
          {contact.is_starred && <span className="text-warn text-[10px]">★</span>}
        </div>
        <div className="text-[11.5px] text-ink-2 mt-0.5 font-medium truncate">
          {[contact.role, contactCompany(contact)].filter(Boolean).join(" · ") || "—"}
        </div>
        <div className="flex gap-1 mt-[5px] flex-wrap items-center">
          {cat && (
            <span
              className="text-[10px] font-semibold px-[7px] py-0.5 rounded border bg-bg-subtle text-ink-2 border-hair"
              style={
                cat.color
                  ? { borderColor: cat.color, color: cat.color, background: `${cat.color}14` }
                  : undefined
              }
            >
              {cat.name}
            </span>
          )}
          {contact.tags.slice(0, 3).map((t) => (
            <span
              key={t.id}
              className="text-[10px] font-semibold px-[7px] py-0.5 rounded border bg-hair-2 text-ink-2 border-hair"
            >
              #{t.name}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="text-[10px] font-semibold text-ink-3">+{contact.tags.length - 3}</span>
          )}
        </div>
      </div>

      <div className="flex gap-1 shrink-0 text-ink-3">
        {contact.phone && <Icon name="phone" size={13} />}
        {contact.email && <Icon name="mail" size={13} />}
      </div>
    </button>
  )
}
