"use client"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import type { Contact, Category } from "@/lib/contacts-types"
import { avatarTone, displayLabel, initialsOf, categoryById, formatPhone, contactCompany } from "./utils"

export function ContactDetail({
  contact,
  categories,
  onClose,
  onEdit,
  onDelete,
}: {
  contact: Contact | null
  categories: Category[]
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  if (!contact) {
    return null
  }

  const cat = categoryById(categories, contact.category_id)

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-[420px] max-w-full h-full bg-card border-l border-hair flex flex-col overflow-hidden shadow-xl">
        <div className="relative px-5 pt-6 pb-[18px] border-b border-hair bg-bg text-center flex flex-col items-center gap-[10px]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-[26px] h-[26px] rounded-md border border-hair bg-card text-ink-2 hover:border-ink-4 hover:text-ink flex items-center justify-center transition-all"
            aria-label="Fechar"
          >
            <Icon name="close" size={13} />
          </button>
          {contact.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={contact.photo_url}
              alt=""
              className="w-[70px] h-[70px] rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                "w-[70px] h-[70px] rounded-full flex items-center justify-center text-[24px] font-bold tracking-[-.4px] text-white",
                avatarTone(contact.id)
              )}
            >
              {initialsOf(contact)}
            </div>
          )}
          <div className="text-[16px] font-bold text-ink tracking-[-.3px] mt-[6px] flex items-center gap-[6px]">
            {displayLabel(contact)}
            {contact.is_starred && <span className="text-warn text-xs">★</span>}
          </div>
          <div className="text-xs text-ink-2 font-medium leading-[1.4] px-2">
            {[contact.role, contactCompany(contact)].filter(Boolean).join(" · ") || "—"}
          </div>
          <div className="flex gap-[6px] mt-[10px] w-full">
            <button
              onClick={onEdit}
              className="flex-1 px-2 py-2 rounded-md bg-accent text-white font-semibold text-[11.5px] hover:bg-accent-hover transition-colors flex items-center justify-center gap-[5px]"
            >
              <Icon name="edit" size={13} />
              Editar
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-md border border-red-200 bg-red-50 text-err font-semibold text-[11.5px] hover:bg-red-100 transition-colors flex items-center justify-center gap-[5px]"
            >
              <Icon name="trash" size={13} />
              Apagar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-[18px]">
          <Section title="Informações">
            {contact.phone && (
              <InfoRow icon="phone" label="Telefone">
                {formatPhone(contact.phone)}
              </InfoRow>
            )}
            {contact.email && (
              <InfoRow icon="mail" label="E-mail">
                <span className="break-all">{contact.email}</span>
              </InfoRow>
            )}
            {(contact.organization || contact.company_name) && (
              <InfoRow icon="building" label="Empresa">
                {contact.organization ? (
                  <span>
                    {contact.organization.name}
                    {contact.organization.cnpj && (
                      <span className="text-ink-3 font-medium ml-1 mono text-[10.5px]">
                        ·{" "}
                        {contact.organization.cnpj.replace(
                          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                          "$1.$2.$3/$4-$5"
                        )}
                      </span>
                    )}
                    {contact.organization.industry && (
                      <span className="block text-ink-3 font-medium text-[10.5px] mt-0.5">
                        {contact.organization.industry}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-ink-3 italic">{contact.company_name} (texto livre)</span>
                )}
              </InfoRow>
            )}
            {contact.role && <InfoRow icon="user" label="Cargo">{contact.role}</InfoRow>}
            {contact.birthday && (
              <InfoRow icon="calendar" label="Aniversário">
                {new Date(contact.birthday + "T00:00:00").toLocaleDateString("pt-BR")}
              </InfoRow>
            )}
            {cat && (
              <InfoRow icon="flag" label="Categoria">
                <span
                  className="text-[10.5px] font-semibold px-[7px] py-0.5 rounded border bg-bg-subtle text-ink-2 border-hair"
                  style={
                    cat.color
                      ? { borderColor: cat.color, color: cat.color, background: `${cat.color}14` }
                      : undefined
                  }
                >
                  {cat.name}
                </span>
              </InfoRow>
            )}
          </Section>

          {contact.tags.length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((t) => (
                  <span
                    key={t.id}
                    className="text-[10.5px] font-semibold px-2 py-0.5 rounded border bg-hair-2 text-ink-2 border-hair"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {contact.notes && (
            <Section title="Notas">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900 leading-[1.55] font-medium whitespace-pre-wrap">
                {contact.notes}
              </div>
            </Section>
          )}

          <div className="text-[10.5px] text-ink-3 font-medium pt-2 border-t border-hair-2">
            Criado em {new Date(contact.created_at).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.08em] mb-[6px]">{title}</div>
      {children}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-[10px] py-2 text-[12.5px] border-b border-hair-2 last:border-b-0">
      <span className="w-4 shrink-0 flex items-center justify-center text-ink-3 mt-0.5">
        <Icon name={icon} size={13} />
      </span>
      <span className="text-ink-3 text-[11px] w-[80px] shrink-0 font-medium mt-0.5">{label}</span>
      <span className="flex-1 font-semibold text-ink tracking-[-.1px] break-words">{children}</span>
    </div>
  )
}
