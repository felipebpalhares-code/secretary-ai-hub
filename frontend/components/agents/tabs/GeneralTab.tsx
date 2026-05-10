"use client"
import { useEffect, useMemo, useState } from "react"
import { Save } from "lucide-react"
import { type Agent, type AgentUpdate, updateAgent } from "@/lib/agents-api"
import { PermissionGate } from "@/components/auth/PermissionGate"

const MODELS = [
  { value: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5 (preciso)" },
  { value: "claude-haiku-4-5-20251001",  label: "Claude Haiku 4.5 (rápido)" },
]

type FormState = {
  name: string
  role: string
  description: string
  persona: string
  model: string
  temperature: number
  max_tokens: number
}

function formFromAgent(a: Agent): FormState {
  return {
    name:        a.name,
    role:        a.role,
    description: a.description ?? "",
    persona:     a.persona ?? "",
    model:       a.model,
    temperature: a.temperature,
    max_tokens:  a.max_tokens,
  }
}

export function GeneralTab({
  agent,
  onChange,
}: {
  agent: Agent
  onChange: (next: Agent) => void
}) {
  const [form, setForm]       = useState<FormState>(() => formFromAgent(agent))
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Reset form quando o agente vier de fora (após save em outra aba, etc.)
  useEffect(() => {
    setForm(formFromAgent(agent))
  }, [agent])

  const dirty = useMemo(() => {
    const a = formFromAgent(agent)
    return (Object.keys(a) as (keyof FormState)[]).some((k) => a[k] !== form[k])
  }, [agent, form])

  // Preview do system prompt — debounce 500ms para não recalcular a cada tecla
  const [debouncedForm, setDebouncedForm] = useState(form)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedForm(form), 500)
    return () => clearTimeout(t)
  }, [form])

  const promptPreview = useMemo(
    () => buildPreview({ name: debouncedForm.name, role: debouncedForm.role, persona: debouncedForm.persona, instructions: agent.instructions }),
    [debouncedForm.name, debouncedForm.role, debouncedForm.persona, agent.instructions],
  )

  async function handleSave() {
    if (!dirty || saving) return
    setSaving(true); setError(null)
    try {
      const patch: AgentUpdate = {
        name:        form.name.trim(),
        role:        form.role.trim(),
        description: form.description.trim() || null,
        persona:     form.persona.trim() || null,
        model:       form.model,
        temperature: form.temperature,
        max_tokens:  form.max_tokens,
      }
      const next = await updateAgent(agent.id, patch)
      onChange(next)
    } catch (e) {
      setError((e as Error).message ?? "Falha ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <Section title="Identidade">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome">
                <Input value={form.name}
                       onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              </Field>
              <Field label="Função">
                <Input value={form.role}
                       onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
              </Field>
            </div>
            <Field label="Descrição (opcional)">
              <Input value={form.description}
                     onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
            </Field>
            <Field label="Persona">
              <Textarea value={form.persona}
                        onChange={(v) => setForm((f) => ({ ...f, persona: v }))}
                        rows={6} />
            </Field>
          </Section>

          <Section title="Modelo e parâmetros">
            <Field label="Modelo">
              <select
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                className="w-full bg-bg-surface border border-default rounded-default px-3 py-2 text-body text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>

            <SliderField
              label="Temperature"
              hint="Quanto mais alto, mais criativo (e menos previsível)."
              min={0} max={1} step={0.05}
              value={form.temperature}
              onChange={(v) => setForm((f) => ({ ...f, temperature: v }))}
              format={(v) => v.toFixed(2)}
            />

            <SliderField
              label="Max tokens por resposta"
              hint="Limite de tokens da resposta gerada."
              min={256} max={8192} step={128}
              value={form.max_tokens}
              onChange={(v) => setForm((f) => ({ ...f, max_tokens: v }))}
              format={(v) => v.toLocaleString("pt-BR")}
            />
          </Section>

          <Section title="System prompt (compilado)">
            <pre className="text-small text-text-secondary whitespace-pre-wrap font-mono leading-relaxed bg-bg-subtle rounded-md p-4 max-h-72 overflow-y-auto">
              {promptPreview}
            </pre>
            <p className="text-tiny text-text-tertiary mt-2">
              Atualizado automaticamente conforme você edita persona / instruções.
            </p>
          </Section>

          {error && (
            <div className="bg-danger-subtle border border-default rounded-md p-3 text-small text-danger">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer fixo: só aparece se houve mudança */}
      {dirty && (
        <div className="border-t border-default bg-bg-surface px-6 md:px-8 py-3 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-small text-text-secondary">Você tem alterações não salvas</span>
            <PermissionGate module="agentes" action="editar">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition disabled:opacity-50"
              >
                <Save size={14} strokeWidth={1.5} />
                {saving ? "Salvando…" : "Salvar alterações"}
              </button>
            </PermissionGate>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────── primitives ───────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-bg-surface border border-default rounded-xl p-6 flex flex-col gap-4">
      <h2 className="text-subtitle text-text-primary">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-small text-text-secondary mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-bg-surface border border-default rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
    />
  )
}

function Textarea({
  value,
  onChange,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-bg-surface border border-default rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition resize-y"
    />
  )
}

function SliderField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  format: (v: number) => string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-small text-text-secondary">{label}</label>
        <span className="text-small text-text-primary tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
      {hint && <p className="text-tiny text-text-tertiary mt-1">{hint}</p>}
    </div>
  )
}

/* ───────── prompt preview (mirrors backend) ───────── */

function buildPreview({
  name,
  role,
  persona,
  instructions,
}: {
  name: string
  role: string
  persona: string
  instructions: { content: string; order: number }[]
}): string {
  const personaSection = persona.trim() ? `## Quem você é\n${persona.trim()}\n\n` : ""
  const sorted = [...instructions].sort((a, b) => a.order - b.order).filter((i) => i.content.trim())
  const instructionsSection = sorted.length
    ? `## Instruções específicas\n${sorted.map((i) => `- ${i.content.trim()}`).join("\n")}\n\n`
    : ""
  return [
    `Você é ${name || "[nome]"}, ${role || "[função]"}.`,
    "",
    personaSection,
    instructionsSection,
    "Responda sempre em português brasileiro, de forma direta e profissional.",
    "Quando houver contexto relevante de documentos, use-o como base factual e",
    "cite trechos quando apropriado. Se a pergunta estiver fora do seu escopo",
    "ou dos documentos disponíveis, diga isso claramente em vez de inventar.",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
}
