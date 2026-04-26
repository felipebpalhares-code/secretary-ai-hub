import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import type { Event } from "@/lib/agenda-data"

const TAG_CLS = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  red: "bg-red-50 text-red-700 border-red-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  indigo: "bg-accent-soft text-accent border-indigo-200",
}

const AGENT_BG = {
  pink: "bg-pink-50 border-pink-200",
  orange: "bg-orange-50 border-orange-200",
  red: "bg-red-50 border-red-200",
  blue: "bg-blue-50 border-blue-200",
  green: "bg-emerald-50 border-emerald-200",
  purple: "bg-purple-50 border-purple-200",
  amber: "bg-amber-50 border-amber-200",
  indigo: "bg-accent-soft border-indigo-200",
}

const AGENT_HEAD = {
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  red: "bg-err",
  blue: "bg-blue-500",
  green: "bg-ok",
  purple: "bg-purple-500",
  amber: "bg-warn",
  indigo: "bg-accent",
}

const AGENT_TXT = {
  pink: "text-pink-900",
  orange: "text-orange-900",
  red: "text-red-900",
  blue: "text-blue-900",
  green: "text-emerald-900",
  purple: "text-purple-900",
  amber: "text-amber-900",
  indigo: "text-accent",
}

export function EventDetail({ event, onClose }: { event?: Event; onClose: () => void }) {
  if (!event) {
    return (
      <div className="w-[328px] min-w-[328px] bg-card border-l border-hair flex items-center justify-center text-ink-3 text-[12.5px] font-medium px-6">
        Selecione um evento pra ver detalhes
      </div>
    )
  }

  const variant = event.categoryVariant ?? event.color

  return (
    <div className="w-[328px] min-w-[328px] bg-card border-l border-hair flex flex-col overflow-hidden shrink-0">
      <div className="px-5 pt-5 pb-4 border-b border-hair bg-bg">
        <button
          onClick={onClose}
          className="float-right w-[26px] h-[26px] rounded border border-hair bg-card text-ink-2 hover:text-ink hover:border-ink-4 flex items-center justify-center transition-colors"
        >
          <Icon name="close" size={13} />
        </button>
        {event.category && (
          <div
            className={cn(
              "inline-block text-[10px] font-bold px-[9px] py-[3px] rounded mb-2 tracking-[.04em] uppercase border",
              TAG_CLS[variant]
            )}
          >
            {event.category}
          </div>
        )}
        <div className="text-[16px] font-bold text-ink tracking-[-.3px] leading-[1.3]">{event.title}</div>
        <div className="text-[12px] text-ink-2 mt-2 font-semibold">{event.whenLong ?? event.time}</div>
        <div className="flex gap-[5px] mt-3">
          <button className="flex-1 px-2 py-2 rounded-md bg-accent text-white border border-accent text-[11.5px] font-semibold hover:bg-accent-hover transition-colors">
            Entrar
          </button>
          <button className="flex-1 px-2 py-2 rounded-md border border-hair bg-card text-ink text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
            Editar
          </button>
          <button className="flex-1 px-2 py-2 rounded-md border border-hair bg-card text-ink text-[11.5px] font-semibold hover:bg-bg hover:border-ink-4 transition-colors">
            Excluir
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <Section title="Detalhes">
          {event.location && <Row icon="home" label="Local">{event.location}</Row>}
          {event.parent && <Row icon="file" label="Vinculado a">{event.parent}</Row>}
          {event.reminder && <Row icon="bell" label="Lembrete">{event.reminder}</Row>}
          <Row icon="calendar" label="Repete">{event.recurrence ?? "Não se repete"}</Row>
        </Section>

        {event.participants && event.participants.length > 0 && (
          <Section title={`Participantes (${event.participants.length})`}>
            <div className="flex flex-wrap gap-[5px]">
              {event.participants.map((p, i) => (
                <Part key={i} name={p.name} initials={p.initials} />
              ))}
            </div>
          </Section>
        )}

        {event.agenda && event.agenda.length > 0 && (
          <Section title="Pauta da reunião">
            <div className="bg-bg border border-hair rounded-md p-[11px_13px] text-[11.5px] text-ink-2 leading-[1.6] font-medium">
              {event.agenda.map((item, i) => (
                <div key={i}>
                  • {item}
                  {i < event.agenda!.length - 1 && <br />}
                </div>
              ))}
            </div>
          </Section>
        )}

        {event.links && event.links.length > 0 && (
          <Section title="Vínculos no hub">
            {event.links.map((l, i) => (
              <LinkItem key={i} icon={l.icon} title={l.n} sub={l.m} />
            ))}
          </Section>
        )}

        {event.agent && (
          <Section title="Agente responsável">
            <div className={cn("flex items-center gap-[10px] p-[11px_12px] border rounded-md", AGENT_BG[variant])}>
              <div
                className={cn(
                  "w-[30px] h-[30px] rounded-md text-white flex items-center justify-center text-sm font-bold",
                  AGENT_HEAD[variant]
                )}
              >
                {event.agent.emoji}
              </div>
              <div className="flex-1">
                <div className={cn("text-[12px] font-bold tracking-[-.15px]", AGENT_TXT[variant])}>
                  {event.agent.name}
                </div>
                <div className={cn("text-[10.5px] font-medium mt-px leading-[1.45] opacity-80", AGENT_TXT[variant])}>
                  {event.agent.role}
                </div>
              </div>
            </div>
          </Section>
        )}

        {event.notes && (
          <Section title="Notas">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-[11.5px] text-amber-900 leading-[1.55] font-medium">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-[.06em] mb-1">
                Felipe anotou
              </div>
              {event.notes}
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

function Row({
  icon,
  label,
  children,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-[10px] py-[7px] text-[12px] border-b border-hair-2 last:border-b-0">
      <span className="w-4 text-ink-3 shrink-0">
        <Icon name={icon} size={13} />
      </span>
      <span className="text-ink-3 text-[11px] w-[76px] shrink-0 font-medium">{label}</span>
      <span className="font-semibold text-ink flex-1 break-words tracking-[-.1px]">{children}</span>
    </div>
  )
}

function Part({ name, initials }: { name: string; initials: string }) {
  return (
    <span className="inline-flex items-center gap-[6px] px-[10px] py-[3px] pl-[3px] rounded-full bg-bg border border-hair text-[11.5px] font-semibold text-ink">
      <span className="w-5 h-5 rounded-full bg-ink-2 text-white text-[10px] font-bold flex items-center justify-center">
        {initials}
      </span>
      {name}
    </span>
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
    <div className="flex items-center gap-[10px] p-[10px_12px] border border-hair rounded-md text-xs cursor-pointer hover:border-accent hover:bg-accent-soft transition-colors mb-[5px]">
      <div className="w-[26px] h-[26px] rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
        <Icon name={icon} size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-ink tracking-[-.1px]">{title}</div>
        <div className="text-[10.5px] text-ink-3 mt-px font-medium">{sub}</div>
      </div>
      <Icon name="chevron" size={13} className="text-ink-3" />
    </div>
  )
}
