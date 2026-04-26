import { Icon } from "../Icon"
import { Badge } from "../ui/Badge"

export function DocDetail({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-[340px] min-w-[340px] bg-card border-l border-hair flex flex-col overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-hair shrink-0">
        <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">Detalhes do documento</div>
        <button
          onClick={onClose}
          className="text-ink-3 hover:text-ink p-1 rounded hover:bg-bg transition-colors"
        >
          <Icon name="close" size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[18px] py-4 flex flex-col gap-[18px]">
        <div className="bg-bg border border-hair rounded-md p-4 flex flex-col items-center gap-[10px]">
          <div className="w-[100px] h-[130px] bg-card border border-hair rounded flex items-center justify-center text-err text-[28px] font-extrabold">
            PDF
          </div>
          <div className="text-[12px] font-bold text-ink text-center break-words tracking-[-.1px]">
            Certidao_Negativa_Federal.pdf
          </div>
          <div className="text-[10.5px] text-ink-3 flex gap-2 font-medium">
            <span>2.1 MB</span>
            <span>·</span>
            <span>3 páginas</span>
          </div>
        </div>

        <Section title="Classificação">
          <DetailRow label="Categoria">
            <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
              Governo
            </span>
          </DetailRow>
          <DetailRow label="Classificado por">Marcos (agente)</DetailRow>
          <DetailRow label="Confiança">
            <Badge variant="green">98%</Badge>
          </DetailRow>
        </Section>

        <Section title="Origem">
          <DetailRow label="Canal">Upload manual</DetailRow>
          <DetailRow label="Enviado">20/04/2026 · 14:32</DetailRow>
          <DetailRow label="Por">Felipe</DetailRow>
        </Section>

        <Section title="Metadados extraídos">
          <DetailRow label="Órgão">Receita Federal</DetailRow>
          <DetailRow label="CNPJ">
            <span className="mono text-[11px]">12.345.678/0001-90</span>
          </DetailRow>
          <DetailRow label="Emissão">03/02/2026</DetailRow>
          <DetailRow label="Validade" valueClass="text-err font-bold">
            05/05/2026
          </DetailRow>
          <DetailRow label="Situação">
            <Badge variant="green">Regular</Badge>
          </DetailRow>
        </Section>

        <div>
          <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.08em] mb-[6px] flex items-center gap-2">
            <span className="bg-ok text-white text-[9px] font-bold px-[6px] py-[2px] rounded">OCR</span>
            Conteúdo pesquisável
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-[11px] text-emerald-900 leading-[1.55] font-medium">
            "CERTIDÃO NEGATIVA DE DÉBITOS RELATIVOS AOS TRIBUTOS FEDERAIS E À DÍVIDA ATIVA DA UNIÃO.
            Nome: PALHARESTECH LTDA. CNPJ: 12.345.678/0001-90. Conforme verificação nos sistemas
            informatizados..."
          </div>
        </div>

        <Section title="Tags">
          <div className="flex flex-wrap gap-1">
            {["certidão", "receita-federal", "palharestech", "vence-breve"].map((t) => (
              <span
                key={t}
                className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-accent-soft text-accent border border-indigo-200"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Ações">
          <div className="grid grid-cols-2 gap-[5px]">
            <ActionBtn label="Visualizar" primary />
            <ActionBtn label="Baixar" />
            <ActionBtn label="Compartilhar" />
            <ActionBtn label="Assinar" />
            <ActionBtn label="Mover" />
            <ActionBtn label="Versões (1)" />
          </div>
        </Section>

        <div>
          <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.08em] mb-[6px]">
            Ações programadas · Marcos
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-[11.5px] text-amber-900 leading-[1.6] font-medium">
            <div className="text-[10.5px] font-bold text-amber-700 uppercase tracking-[.05em] mb-1">
              Alertas
            </div>
            • 30/04 · lembrete 5 dias antes
            <br />• 02/05 · lembrete 3 dias antes
            <br />• 04/05 · lembrete do dia anterior
            <br />
            <br />
            <div className="text-[10.5px] font-bold text-amber-700 uppercase tracking-[.05em] mb-1">
              Automação
            </div>
            Marcos tentará renovar automaticamente no portal e-CAC quando faltarem 5 dias.
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

function DetailRow({
  label,
  children,
  valueClass,
}: {
  label: string
  children: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-[10px] py-[7px] text-[12px] border-b border-hair-2 last:border-b-0">
      <span className="text-ink-3 text-[11px] w-[88px] shrink-0 font-medium">{label}</span>
      <span className={`font-semibold text-ink flex-1 text-right break-words tracking-[-.1px] ${valueClass ?? ""}`}>
        {children}
      </span>
    </div>
  )
}

function ActionBtn({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button
      className={
        primary
          ? "px-2 py-2 rounded-md bg-accent text-white border border-accent font-semibold text-[11.5px] hover:bg-accent-hover transition-colors"
          : "px-2 py-2 rounded-md bg-card text-ink border border-hair font-semibold text-[11.5px] hover:bg-bg hover:border-ink-4 transition-colors"
      }
    >
      {label}
    </button>
  )
}
