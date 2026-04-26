import { Icon } from "../Icon"
import { Badge } from "../ui/Badge"
import type { Contact } from "@/lib/contacts-data"
import { cn } from "@/lib/cn"

const AV_TONE = {
  slate: "bg-slate-700",
  slate2: "bg-slate-600",
  slate3: "bg-slate-500",
  slate4: "bg-slate-400",
  indigo: "bg-indigo-600",
  indigo2: "bg-indigo-700",
  emerald: "bg-emerald-600",
  zinc: "bg-zinc-600",
  zinc2: "bg-zinc-700",
} as const

export function ContactDetail({
  contact,
  onClose,
}: {
  contact?: Contact
  onClose?: () => void
}) {
  if (!contact) {
    return (
      <div className="w-[340px] min-w-[340px] bg-card border-l border-hair flex items-center justify-center text-ink-3 text-[12.5px] font-medium px-6">
        Selecione um contato pra ver detalhes
      </div>
    )
  }

  return (
    <div className="w-[340px] min-w-[340px] bg-card border-l border-hair flex flex-col overflow-hidden shrink-0">
      <div className="relative px-5 pt-6 pb-[18px] border-b border-hair bg-bg text-center flex flex-col items-center gap-[10px]">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-[26px] h-[26px] rounded-md border border-hair bg-card text-ink-2 hover:border-ink-4 hover:text-ink flex items-center justify-center transition-all"
          >
            <Icon name="close" size={13} />
          </button>
        )}
        <div
          className={cn(
            "w-[70px] h-[70px] rounded-full flex items-center justify-center text-[24px] font-bold tracking-[-.4px] text-white",
            AV_TONE[contact.avatarTone]
          )}
        >
          {contact.initials}
        </div>
        <div className="text-[16px] font-bold text-ink tracking-[-.3px] mt-[6px] flex items-center gap-[6px]">
          {contact.name}
          {contact.starred && <span className="text-warn text-xs">★</span>}
        </div>
        <div className="text-xs text-ink-2 font-medium leading-[1.4] px-2">
          {contact.fullRole ?? contact.role}
        </div>
        <div className="flex gap-[5px] mt-[10px] w-full">
          <button className="flex-1 px-2 py-2 rounded-md bg-accent text-white font-semibold text-[11.5px] hover:bg-accent-hover transition-colors flex items-center justify-center gap-[5px]">
            <Icon name="chat" size={13} />
            WhatsApp
          </button>
          <button className="flex-1 px-2 py-2 rounded-md border border-hair bg-card text-ink font-semibold text-[11.5px] hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center">
            <Icon name="phone" size={13} />
          </button>
          <button className="flex-1 px-2 py-2 rounded-md border border-hair bg-card text-ink font-semibold text-[11.5px] hover:bg-bg hover:border-ink-4 transition-colors flex items-center justify-center">
            <Icon name="mail" size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-[18px]">
        <Section title="Informações">
          {contact.birthday && (
            <InfoRow icon="calendar" label="Aniversário">
              <span
                className={cn(
                  "font-bold",
                  contact.birthday.includes("amanhã") || contact.birthday.includes("dias")
                    ? "text-err"
                    : "text-ink"
                )}
              >
                {contact.birthday}
              </span>
            </InfoRow>
          )}
          {contact.phone && (
            <InfoRow icon="phone" label="Telefone" copy={contact.phone !== "—" && !contact.phone.includes("Sem")}>
              {contact.phone}
            </InfoRow>
          )}
          {contact.email && (
            <InfoRow icon="mail" label="E-mail" copy={contact.email !== "—"}>
              {contact.email}
            </InfoRow>
          )}
          {contact.address && <InfoRow icon="home" label="Endereço">{contact.address}</InfoRow>}
          {contact.city && !contact.address && <InfoRow icon="home" label="Cidade">{contact.city}</InfoRow>}
          {contact.cpfMasked && (
            <InfoRow icon="card" label="CPF">
              <span className="mono text-[11px]">{contact.cpfMasked}</span>
            </InfoRow>
          )}
        </Section>

        <Section title="Tags">
          <div className="flex flex-wrap gap-1">
            {contact.tags.map((t, i) => (
              <Badge key={i} variant={t.variant === "gray" ? "gray" : t.variant === "neutral" ? "neutral" : t.variant}>
                {t.label}
              </Badge>
            ))}
            <button className="text-[10.5px] font-semibold px-2 py-0.5 rounded border border-dashed border-hair text-ink-3 hover:border-accent hover:text-accent transition-colors">
              + Tag
            </button>
          </div>
        </Section>

        {contact.timeline && contact.timeline.length > 0 && (
          <Section title="Últimas interações">
            {contact.timeline.map((t, i) => (
              <TimelineItem key={i} icon={t.icon} title={t.title} sub={t.sub} time={t.time} />
            ))}
          </Section>
        )}

        {contact.links && contact.links.length > 0 && (
          <Section title="Vínculos no hub">
            {contact.links.map((l, i) => (
              <LinkItem key={i} icon={l.icon} title={l.n} sub={l.m} />
            ))}
          </Section>
        )}

        {contact.agent && (
          <Section title="Agente responsável">
            <div className="flex items-center gap-[10px] p-[11px_12px] bg-bg border border-hair rounded-md">
              <div className="w-[32px] h-[32px] rounded-md bg-ink text-white flex items-center justify-center text-sm font-bold">
                {contact.agent.emoji}
              </div>
              <div className="flex-1">
                <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">{contact.agent.name}</div>
                <div className="text-[11px] text-ink-2 font-medium mt-px leading-[1.4]">{contact.agent.role}</div>
              </div>
              <Icon name="chevron" size={13} className="text-ink-3" />
            </div>
          </Section>
        )}

        {contact.notes && (
          <Section title="Notas privadas">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900 leading-[1.55] font-medium">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-[.07em] mb-1">
                Felipe anotou
              </div>
              {contact.notes}
            </div>
          </Section>
        )}
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
  copy,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  children: React.ReactNode
  copy?: boolean
}) {
  return (
    <div className="flex items-center gap-[10px] py-2 text-[12.5px] border-b border-hair-2 last:border-b-0">
      <span className="w-4 shrink-0 flex items-center justify-center text-ink-3">
        <Icon name={icon} size={13} />
      </span>
      <span className="text-ink-3 text-[11px] w-[72px] shrink-0 font-medium">{label}</span>
      <span className="flex-1 font-semibold text-ink tracking-[-.1px] break-words">{children}</span>
      {copy && (
        <button className="text-ink-3 hover:text-accent p-1 rounded transition-colors">
          <Icon name="edit" size={12} />
        </button>
      )}
    </div>
  )
}

function TimelineItem({
  icon,
  title,
  sub,
  time,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  title: string
  sub: string
  time: string
}) {
  return (
    <div className="flex gap-[10px] py-[9px] text-xs border-b border-hair-2 last:border-b-0 cursor-pointer hover:bg-bg -mx-[10px] px-[10px] rounded-md transition-colors">
      <div className="w-7 h-7 rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
        <Icon name={icon} size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-ink tracking-[-.1px]">{title}</div>
        <div className="text-[11px] text-ink-2 mt-0.5 font-medium leading-[1.4]">{sub}</div>
        <div className="text-[10.5px] text-ink-3 mt-1 font-medium">{time}</div>
      </div>
    </div>
  )
}

function LinkItem({
  icon,
  title,
  sub,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  title: string
  sub: string
}) {
  return (
    <div className="flex items-center gap-[10px] p-[9px_10px] border border-hair rounded-md text-xs cursor-pointer hover:border-accent hover:bg-accent-soft transition-colors mb-[5px]">
      <div className="w-[26px] h-[26px] rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
        <Icon name={icon} size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-ink tracking-[-.1px]">{title}</div>
        <div className="text-[10.5px] text-ink-3 font-medium mt-px">{sub}</div>
      </div>
      <Icon name="chevron" size={13} className="text-ink-3" />
    </div>
  )
}
