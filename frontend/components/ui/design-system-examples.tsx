"use client"
/**
 * Playground visual do Design System.
 * Renderiza todos os componentes-base do sistema com tokens novos.
 * Não importa de @/components/ui/* existentes — pra deixar o exemplo claro
 * sobre quais classes/comportamentos a refatoração deve atingir.
 */
import { useState } from "react"

export function DesignSystemExamples() {
  const [modalOpen, setModalOpen] = useState(false)
  const [text, setText] = useState("")

  return (
    <div className="bg-bg-app min-h-screen text-text-primary font-sans">
      {/* Header (Apple chrome, generoso) */}
      <header className="bg-bg-surface border-b border-default px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-display text-text-primary">Design System</h1>
          <p className="text-body text-text-secondary mt-1">
            Apple no chrome · Linear no conteúdo · referência visual de tokens e componentes
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-loose flex flex-col gap-section">
        <Section title="Cores" subtitle="Paleta neutra com sotaque grafite. Cores semânticas raríssimas.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Swatch name="bg-app" hex="#FAFAFA" cls="bg-bg-app border-default" />
            <Swatch name="bg-surface" hex="#FFFFFF" cls="bg-bg-surface border-default" />
            <Swatch name="bg-subtle" hex="#F4F4F5" cls="bg-bg-subtle border-default" />
            <Swatch name="bg-muted" hex="#E4E4E7" cls="bg-bg-muted border-default" />
            <Swatch name="brand" hex="#1E293B" cls="bg-brand text-white" />
            <Swatch name="brand-subtle" hex="#F1F5F9" cls="bg-brand-subtle border-default" />
            <Swatch name="success" hex="#059669" cls="bg-success text-white" />
            <Swatch name="success-subtle" hex="#ECFDF5" cls="bg-success-subtle border-default" />
            <Swatch name="warning" hex="#D97706" cls="bg-warning text-white" />
            <Swatch name="warning-subtle" hex="#FFFBEB" cls="bg-warning-subtle border-default" />
            <Swatch name="danger" hex="#DC2626" cls="bg-danger text-white" />
            <Swatch name="danger-subtle" hex="#FEF2F2" cls="bg-danger-subtle border-default" />
          </div>
        </Section>

        <Section title="Tipografia" subtitle="Inter. Escala calibrada pra densidade de informação.">
          <div className="bg-bg-surface border border-default rounded-xl p-8 flex flex-col gap-4">
            <p className="text-display">Display · 32 / 600</p>
            <p className="text-title">Title · 24 / 600</p>
            <p className="text-subtitle">Subtitle · 18 / 500</p>
            <p className="text-body">Body · 14 / 400 · texto padrão pra leitura confortável</p>
            <p className="text-body-strong">Body strong · 14 / 500 · ênfase em corpo</p>
            <p className="text-small text-text-secondary">Small · 13 / 400 · auxiliar, metadados</p>
            <p className="text-tiny text-text-tertiary">Tiny · 12 / 400 · micro labels, badges</p>
          </div>
        </Section>

        <Section title="Botões" subtitle="Primary é grafite. Destructive só em ações irreversíveis.">
          <div className="bg-bg-surface border border-default rounded-xl p-8 flex flex-col gap-6">
            <Row label="Variantes">
              <BtnPrimary>Primary</BtnPrimary>
              <BtnSecondary>Secondary</BtnSecondary>
              <BtnGhost>Ghost</BtnGhost>
              <BtnDestructive>Destructive</BtnDestructive>
            </Row>
            <Row label="Tamanhos">
              <BtnPrimary size="sm">Small</BtnPrimary>
              <BtnPrimary>Default</BtnPrimary>
              <BtnPrimary size="lg">Large</BtnPrimary>
            </Row>
            <Row label="Estados">
              <BtnPrimary disabled>Disabled</BtnPrimary>
              <BtnPrimary loading>Loading</BtnPrimary>
            </Row>
          </div>
        </Section>

        <Section title="Inputs" subtitle="Label sempre acima, focus ring sutil em brand.">
          <div className="bg-bg-surface border border-default rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Default">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite algo…"
                className="w-full bg-bg-surface border border-default rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              />
            </Field>
            <Field label="Error" error="CPF inválido. Verifique os dígitos.">
              <input
                defaultValue="111.444.777-XX"
                className="w-full bg-bg-surface border border-danger rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-danger/10 transition"
              />
            </Field>
            <Field label="Disabled">
              <input
                disabled
                value="—"
                className="w-full bg-bg-subtle border border-default rounded-default px-3 py-2 text-body text-text-disabled cursor-not-allowed"
              />
            </Field>
            <Field label="Com hint">
              <input
                placeholder="000.000.000-00"
                className="w-full bg-bg-surface border border-default rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              />
              <p className="text-small text-text-tertiary mt-1">Apenas dígitos, sem máscara.</p>
            </Field>
          </div>
        </Section>

        <Section title="Cards" subtitle="Apple = leve, generoso. Linear = denso, ação.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-surface border border-default rounded-xl p-6 hover:border-strong transition">
              <div className="text-tiny uppercase text-text-tertiary tracking-wider">Apple Card</div>
              <p className="text-subtitle text-text-primary mt-2">Patrimônio total</p>
              <p className="text-display text-text-primary mt-1 tabular-nums">R$ 2.480.000</p>
              <p className="text-small text-success mt-2">+R$ 18.500 nos últimos 30 dias</p>
            </div>
            <div className="bg-bg-surface border border-default rounded-md p-4 hover:shadow-sm hover:border-strong transition">
              <div className="text-body-strong text-text-primary">Reunião com cliente Acme</div>
              <p className="text-small text-text-secondary mt-1">
                Hoje, 14h · Google Meet · 3 participantes
              </p>
              <div className="flex gap-1.5 mt-3">
                <Pill>kanban</Pill>
                <Pill>linear</Pill>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Tabelas" subtitle="Linear, denso. Valores monetários com tabular-nums.">
          <div className="bg-bg-surface border border-default rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-subtle border-b border-strong">
                  <th className="text-small text-text-secondary uppercase tracking-wide font-medium px-4 py-2.5 text-left">
                    Data
                  </th>
                  <th className="text-small text-text-secondary uppercase tracking-wide font-medium px-4 py-2.5 text-left">
                    Descrição
                  </th>
                  <th className="text-small text-text-secondary uppercase tracking-wide font-medium px-4 py-2.5 text-right">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["23/04", "Aço CA-50 — Siderúrgica SP", -24800],
                  ["23/04", "Adiantamento — Acme", 15000],
                  ["22/04", "Folha quinzenal — Roberto", -34200],
                  ["20/04", "Pagamento NF 0892", 38900],
                ].map(([date, desc, value], i) => (
                  <tr
                    key={i}
                    className="border-b border-default last:border-0 hover:bg-bg-subtle transition"
                  >
                    <td className="text-body text-text-secondary px-4 py-3">{date}</td>
                    <td className="text-body text-text-primary px-4 py-3">{desc}</td>
                    <td
                      className={`text-body tabular-nums text-right px-4 py-3 font-medium ${
                        (value as number) >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {(value as number).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Modal" subtitle="Apple chrome. Backdrop sutil 40%, fade + scale 200ms.">
          <div className="flex gap-3">
            <BtnPrimary onClick={() => setModalOpen(true)}>Abrir modal de exemplo</BtnPrimary>
          </div>
          {modalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="absolute inset-0 bg-black/40 transition-opacity"
                onClick={() => setModalOpen(false)}
              />
              <div className="relative bg-bg-surface rounded-xl shadow-lg max-w-2xl w-full mx-4 p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-title text-text-primary">Confirmar ação</h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-text-tertiary hover:text-text-primary p-1 rounded-default"
                    aria-label="Fechar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <p className="text-body text-text-secondary leading-relaxed">
                  Modais usam Apple chrome — bordas suaves, padding generoso, sem afobamento.
                  O backdrop é 40% (não 50%) pra parecer menos invasivo.
                </p>
                <div className="flex justify-end gap-2 mt-loose">
                  <BtnSecondary onClick={() => setModalOpen(false)}>Cancelar</BtnSecondary>
                  <BtnPrimary onClick={() => setModalOpen(false)}>Confirmar</BtnPrimary>
                </div>
              </div>
            </div>
          )}
        </Section>

        <Section title="Empty state" subtitle="Apple, generoso. Ícone grande, ação centralizada.">
          <div className="bg-bg-surface border border-default rounded-xl flex flex-col items-center justify-center py-16 px-6">
            <div className="text-text-tertiary">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <polyline points="9 11 12 14 17 9" />
              </svg>
            </div>
            <p className="text-subtitle text-text-primary mt-4">Nenhuma tarefa por aqui</p>
            <p className="text-body text-text-secondary mt-2 max-w-md text-center">
              Quando você criar a primeira tarefa, ela aparece nessa lista. Aperte
              <Kbd>N</Kbd> ou clique no botão abaixo pra começar.
            </p>
            <div className="mt-6">
              <BtnPrimary>Criar primeira tarefa</BtnPrimary>
            </div>
          </div>
        </Section>

        <Section title="Loading states" subtitle="Skeleton no lugar de spinner gigante.">
          <div className="bg-bg-surface border border-default rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Spinner size={20} />
              <span className="text-body text-text-secondary">Spinner inline</span>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-bg-muted rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-bg-muted rounded animate-pulse" />
            </div>
            <div>
              <BtnPrimary loading>Salvando…</BtnPrimary>
            </div>
          </div>
        </Section>

        <Section title="Badges & semânticos" subtitle="Sutis, baixo contraste.">
          <div className="bg-bg-surface border border-default rounded-xl p-6 flex flex-wrap gap-2">
            <Badge tone="brand">Em andamento</Badge>
            <Badge tone="success">Pago</Badge>
            <Badge tone="warning">Vence em 30d</Badge>
            <Badge tone="danger">Atrasado</Badge>
            <Badge tone="info">Informativo</Badge>
            <Badge tone="muted">Concluído</Badge>
          </div>
        </Section>
      </main>

      <footer className="border-t border-default mt-section py-loose">
        <div className="max-w-5xl mx-auto px-8 text-small text-text-tertiary">
          Tokens em <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-tiny">DESIGN_SYSTEM.md</code>{" "}
          · Tailwind em{" "}
          <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-tiny">tailwind.config.ts</code>{" "}
          · TS em{" "}
          <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-tiny">lib/design-tokens.ts</code>
        </div>
      </footer>
    </div>
  )
}

/* ──────── Building blocks ──────── */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-title text-text-primary">{title}</h2>
        <p className="text-body text-text-secondary mt-1">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-tiny uppercase text-text-tertiary tracking-wider font-medium mb-2">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-small text-text-secondary mb-1">{label}</label>
      {children}
      {error && <p className="text-small text-danger mt-1">{error}</p>}
    </div>
  )
}

function Swatch({ name, hex, cls }: { name: string; hex: string; cls: string }) {
  return (
    <div className={`rounded-md border p-4 ${cls}`}>
      <div className="text-body-strong">{name}</div>
      <div className="text-tiny mt-0.5 opacity-70 mono">{hex}</div>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-bg-subtle text-text-secondary rounded-sm text-tiny px-2 py-0.5 font-medium">
      {children}
    </span>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block bg-bg-subtle border border-default rounded text-tiny px-1.5 py-0.5 mx-1 font-mono">
      {children}
    </kbd>
  )
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-spin text-text-tertiary"
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}

/* ──────── Botões ──────── */

type BtnSize = "sm" | "default" | "lg"
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: BtnSize
  loading?: boolean
}

const SIZE_CLS: Record<BtnSize, string> = {
  sm: "px-3 py-1.5 text-small",
  default: "px-4 py-2 text-body",
  lg: "px-6 py-3 text-subtitle",
}

function BtnPrimary({ size = "default", loading, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center gap-2 bg-brand text-white rounded-default font-medium shadow-xs hover:bg-brand-hover transition disabled:opacity-50 disabled:cursor-not-allowed ${SIZE_CLS[size]}`}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

function BtnSecondary({ size = "default", children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 bg-bg-surface text-text-primary border border-default rounded-default font-medium hover:bg-bg-subtle hover:border-strong transition disabled:opacity-50 disabled:cursor-not-allowed ${SIZE_CLS[size]}`}
    >
      {children}
    </button>
  )
}

function BtnGhost({ size = "sm", children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 bg-transparent text-text-secondary rounded-default hover:bg-bg-subtle hover:text-text-primary transition disabled:opacity-50 disabled:cursor-not-allowed ${SIZE_CLS[size]}`}
    >
      {children}
    </button>
  )
}

function BtnDestructive({ size = "default", children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 bg-danger text-white rounded-default font-medium hover:bg-red-700 transition disabled:opacity-50 ${SIZE_CLS[size]}`}
    >
      {children}
    </button>
  )
}

/* ──────── Badges ──────── */

const BADGE_CLS = {
  brand: "bg-brand-subtle text-brand border-default",
  success: "bg-success-subtle text-success border-default",
  warning: "bg-warning-subtle text-warning border-default",
  danger: "bg-danger-subtle text-danger border-default",
  info: "bg-info-subtle text-info border-default",
  muted: "bg-bg-subtle text-text-secondary border-default",
} as const

function Badge({
  tone,
  children,
}: {
  tone: keyof typeof BADGE_CLS
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center text-tiny font-medium px-2 py-0.5 rounded-sm border ${BADGE_CLS[tone]}`}
    >
      {children}
    </span>
  )
}
