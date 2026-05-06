"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, Loader2, Pencil, X } from "lucide-react"
import { useAgentWizard, type WizardInstruction } from "@/stores/agentWizard"
import {
  addInstruction,
  createAgent,
  updateAgent,
  uploadDocument,
} from "@/lib/agents-api"
import { WizardFooter } from "./WizardFooter"

type FlowStatus = "pending" | "running" | "ok" | "error"

type FlowStep = {
  key: string
  label: string
  status: FlowStatus
  detail?: string
}

export function StepReview() {
  const wizard = useAgentWizard()
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [steps, setSteps]   = useState<FlowStep[]>([])

  function patch(key: string, p: Partial<FlowStep>) {
    setSteps((curr) => curr.map((s) => (s.key === key ? { ...s, ...p } : s)))
  }

  async function createFlow() {
    setRunning(true)

    const initialSteps: FlowStep[] = [
      { key: "create",    label: "Criando agente",                                   status: "running" },
      { key: "instructs", label: `Adicionando instruções (0/${wizard.instructions.length})`, status: "pending" },
      ...wizard.documents.map((d, i) => ({
        key: `doc-${i}`,
        label: `Subindo "${d.name}"`,
        status: "pending" as FlowStatus,
      })),
      { key: "activate",  label: "Ativando agente",                                  status: "pending" },
    ]
    setSteps(initialSteps)

    let agentId: string | null = null
    let degraded = false

    /* 1. Cria agente em draft */
    try {
      const agent = await createAgent({
        name:        wizard.name.trim(),
        role:        wizard.role.trim(),
        persona:     wizard.persona.trim() || null,
        status:      "draft",
        // instructions: vamos enviar uma por uma logo abaixo, pra acompanhar progresso
      })
      agentId = agent.id
      patch("create", { status: "ok" })
    } catch (e) {
      patch("create", { status: "error", detail: (e as Error).message })
      setRunning(false)
      return
    }

    /* 2. Instruções */
    if (wizard.instructions.length === 0) {
      patch("instructs", { status: "ok", label: "Sem instruções a adicionar" })
    } else {
      patch("instructs", { status: "running" })
      let done = 0
      for (let i = 0; i < wizard.instructions.length; i++) {
        const ins = wizard.instructions[i] as WizardInstruction
        try {
          await addInstruction(agentId, { content: ins.content.trim(), order: i })
          done += 1
          patch("instructs", { label: `Adicionando instruções (${done}/${wizard.instructions.length})` })
        } catch {
          degraded = true
        }
      }
      patch("instructs", {
        status: degraded ? "error" : "ok",
        label: `${done}/${wizard.instructions.length} instruções`,
      })
    }

    /* 3. Documentos — sequencial pra não estressar o backend */
    for (let i = 0; i < wizard.documents.length; i++) {
      const file = wizard.documents[i]
      patch(`doc-${i}`, { status: "running" })
      try {
        await uploadDocument(agentId, file)
        patch(`doc-${i}`, { status: "ok" })
      } catch (e) {
        patch(`doc-${i}`, { status: "error", detail: (e as Error).message })
        degraded = true
      }
    }

    /* 4. Ativa */
    patch("activate", { status: "running" })
    try {
      await updateAgent(agentId, { status: "active" })
      patch("activate", { status: "ok" })
    } catch {
      patch("activate", { status: "error" })
      degraded = true
    }

    /* 5. Redirect com flash. Pequena pausa pra usuário ver o ✓. */
    await new Promise((r) => setTimeout(r, 600))
    router.push(`/agentes/${agentId}?flash=${degraded ? "created-partial" : "created"}`)
  }

  if (running) return <CreatingScreen steps={steps} />

  const promptPreview = buildSystemPromptPreview(wizard)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-loose">
        <div className="max-w-3xl mx-auto flex flex-col gap-comfortable">
          <div>
            <h1 className="text-display text-text-primary">Revise antes de criar</h1>
            <p className="text-body text-text-secondary mt-2">
              Você ainda pode voltar e ajustar qualquer passo.
            </p>
          </div>

          <SummaryCard title="Identidade" onEdit={() => wizard.setStep(1)}>
            <div className="text-body-strong text-text-primary">{wizard.name || "—"}</div>
            <div className="text-small text-text-secondary">{wizard.role || "—"}</div>
          </SummaryCard>

          <SummaryCard title="Persona" onEdit={() => wizard.setStep(2)}>
            <PersonaPreview text={wizard.persona} />
          </SummaryCard>

          <SummaryCard
            title={`Instruções (${wizard.instructions.length})`}
            onEdit={() => wizard.setStep(3)}
          >
            {wizard.instructions.length === 0 ? (
              <div className="text-small text-text-tertiary">Nenhuma instrução adicionada</div>
            ) : (
              <ol className="list-decimal list-inside text-body text-text-primary space-y-1">
                {wizard.instructions.map((ins) => (
                  <li key={ins.id} className="line-clamp-2">{ins.content}</li>
                ))}
              </ol>
            )}
          </SummaryCard>

          <SummaryCard
            title={`Documentos (${wizard.documents.length})`}
            onEdit={() => wizard.setStep(4)}
          >
            {wizard.documents.length === 0 ? (
              <div className="text-small text-text-tertiary">Sem documentos pra treinar</div>
            ) : (
              <ul className="text-body text-text-primary space-y-1">
                {wizard.documents.map((d, i) => (
                  <li key={i}>{d.name}</li>
                ))}
              </ul>
            )}
          </SummaryCard>

          <div className="bg-bg-surface border border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-subtitle text-text-primary">System prompt gerado</h2>
              <span className="text-tiny text-text-tertiary">ajustável depois</span>
            </div>
            <pre className="text-small text-text-secondary whitespace-pre-wrap font-mono leading-relaxed bg-bg-subtle rounded-md p-4 max-h-72 overflow-y-auto">
              {promptPreview}
            </pre>
          </div>
        </div>
      </div>

      <WizardFooter onBack={wizard.prev}>
        <button
          type="button"
          onClick={createFlow}
          className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-5 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition"
        >
          Criar agente
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </WizardFooter>
    </div>
  )
}

/* ───────── building blocks ───────── */

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-bg-surface border border-default rounded-xl p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-subtitle text-text-primary">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary px-2 py-1 rounded-default hover:bg-bg-subtle transition"
        >
          <Pencil size={12} strokeWidth={1.5} />
          Editar
        </button>
      </div>
      {children}
    </div>
  )
}

function PersonaPreview({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  if (!text) return <span className="text-small text-text-tertiary">—</span>
  const truncated = text.length > 240 ? text.slice(0, 240).trimEnd() + "…" : text
  return (
    <div>
      <p className="text-body text-text-primary whitespace-pre-line">{open ? text : truncated}</p>
      {text.length > 240 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-small text-brand hover:underline mt-1"
        >
          {open ? "ver menos" : "ver mais"}
        </button>
      )}
    </div>
  )
}

function CreatingScreen({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-loose">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display text-text-primary">Criando seu agente</h1>
        <p className="text-body text-text-secondary mt-2">
          Aguarde — não feche esta tela.
        </p>
        <div className="mt-loose bg-bg-surface border border-default rounded-xl p-6 flex flex-col gap-3">
          {steps.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <StatusGlyph status={s.status} />
              <div className="flex-1">
                <div className="text-body text-text-primary">{s.label}</div>
                {s.detail && <div className="text-small text-danger mt-0.5">{s.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusGlyph({ status }: { status: FlowStatus }) {
  if (status === "ok")
    return (
      <span className="w-5 h-5 rounded-full bg-success-subtle text-success flex items-center justify-center">
        <Check size={12} strokeWidth={2} />
      </span>
    )
  if (status === "running")
    return <Loader2 size={20} strokeWidth={1.5} className="text-brand animate-spin" />
  if (status === "error")
    return (
      <span className="w-5 h-5 rounded-full bg-danger-subtle text-danger flex items-center justify-center">
        <X size={12} strokeWidth={2} />
      </span>
    )
  return <span className="w-5 h-5 rounded-full bg-bg-muted" />
}

/* ───────── system prompt preview (mirrors backend) ───────── */

function buildSystemPromptPreview(s: ReturnType<typeof useAgentWizard.getState>): string {
  const personaSection = s.persona.trim()
    ? `## Quem você é\n${s.persona.trim()}\n\n`
    : ""
  const filtered = s.instructions.filter((i) => i.content.trim())
  const instructionsSection = filtered.length
    ? `## Instruções específicas\n${filtered.map((i) => `- ${i.content.trim()}`).join("\n")}\n\n`
    : ""
  return [
    `Você é ${s.name || "[nome]"}, ${s.role || "[função]"}.`,
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
