import { Icon } from "../Icon"

const TAG_CLS = {
  hub: "bg-accent-soft text-accent border-indigo-200",
  silva: "bg-purple-50 text-purple-700 border-purple-200",
  ricardo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ana: "bg-pink-50 text-pink-700 border-pink-200",
}

export function PhoneMockup() {
  return (
    <div className="p-5 flex flex-col items-center gap-3 bg-bg border-r border-hair">
      <div className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em]">
        Como aparece no seu celular
      </div>
      <div className="w-[260px] bg-slate-200 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,.1)] border border-hair flex flex-col max-h-[500px]">
        <div className="bg-ink text-white px-[13px] py-[9px] flex items-center gap-[9px]">
          <div className="w-[30px] h-[30px] rounded-full bg-accent flex items-center justify-center text-xs font-bold">
            FH
          </div>
          <div>
            <div className="text-[12.5px] font-bold">Felipe Hub</div>
            <div className="text-[10px] opacity-70">online</div>
          </div>
        </div>
        <div className="flex-1 p-[10px] flex flex-col gap-[5px] overflow-y-auto bg-slate-100">
          <DatePill>HOJE</DatePill>
          <Sent>menu</Sent>
          <Recv tag="hub" tagLabel="Hub">
            <strong>Bom dia Felipe!</strong>
            <br />
            Sua equipe está pronta. Com quem quer falar?
            <br />
            <br />
            1. Dr. Silva · Jurídico
            <br />
            2. Ricardo · Financeiro
            <br />
            3. Engenheiro · Obras
            <br />
            4. Ana · Família
            <br />
            5. Diretor · Empresas
            <br />
            6. Marcos · Governo
            <br />
            7. Clara · E-mails
            <br />
            8. Dr. Carlos · Saúde
            <br />
            9. Briefing
            <br />
            0. Urgente
          </Recv>
          <Sent>1</Sent>
          <Recv tag="silva" tagLabel="Dr. Silva">
            Bom dia. Alerta crítico: Processo <strong>0001234-56.2024</strong> prazo em{" "}
            <strong>12 dias</strong> (05/05). Dr. Carlos Lima precisa do seu OK hoje. Confirma?
          </Recv>
          <Sent>S, pode avisar</Sent>
          <DatePill>12:00 · alertas</DatePill>
          <Recv tag="ricardo" tagLabel="Ricardo">
            Fatura Nubank vence <strong>amanhã</strong> · R$ 3.240. Pagar agora? (S/N)
          </Recv>
          <Sent>S</Sent>
          <Recv tag="ana" tagLabel="Ana">
            Amanhã aniversário da Ana. Mesa no Mistura 20h reservada. Confirma?
          </Recv>
        </div>
        <div className="flex items-center gap-[6px] px-[10px] py-[7px] bg-slate-200 border-t border-hair">
          <div className="flex-1 bg-card rounded-2xl px-[10px] py-[5px] text-[10px] text-ink-3">
            Mensagem...
          </div>
          <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">
            <Icon name="phone" size={11} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DatePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center my-[3px]">
      <span className="inline-block bg-card border border-hair text-ink-3 text-[9.5px] font-semibold px-2 py-[2px] rounded">
        {children}
      </span>
    </div>
  )
}

function Sent({ children }: { children: React.ReactNode }) {
  return (
    <div className="self-end max-w-[82%] px-2 py-[5px] text-[11px] leading-[1.4] rounded bg-accent-soft border border-indigo-200 text-ink relative">
      {children}
      <span className="text-[9px] text-ink-3 float-right ml-[5px] mt-[2px]">17:15</span>
    </div>
  )
}

function Recv({
  tag,
  tagLabel,
  children,
}: {
  tag: keyof typeof TAG_CLS
  tagLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="self-start max-w-[82%] px-2 py-[5px] text-[11px] leading-[1.4] rounded bg-card border border-hair text-ink relative">
      <span
        className={`inline-block text-[9px] font-bold px-[6px] py-px rounded border mb-[3px] uppercase tracking-[.03em] ${TAG_CLS[tag]}`}
      >
        {tagLabel}
      </span>
      <br />
      {children}
      <span className="text-[9px] text-ink-3 float-right ml-[5px] mt-[2px]">07:15</span>
    </div>
  )
}
