"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { useAgentWizard } from "@/stores/agentWizard"
import { StepIdentity } from "./StepIdentity"
import { StepPersona } from "./StepPersona"
import { StepInstructions } from "./StepInstructions"
import { StepDocuments } from "./StepDocuments"
import { StepReview } from "./StepReview"

const TOTAL_STEPS = 5

const STEP_LABELS: Record<number, string> = {
  1: "Identidade",
  2: "Persona",
  3: "Instruções",
  4: "Documentos",
  5: "Revisão",
}

export function AgentWizard() {
  const router = useRouter()
  const { step, isDirty, reset } = useAgentWizard()
  const [discardOpen, setDiscardOpen] = useState(false)

  // Reset do store ao desmontar a tela inteira
  useEffect(() => () => reset(), [reset])

  // Esc → tentar cancelar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !discardOpen) attemptCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discardOpen])

  function attemptCancel() {
    if (isDirty()) setDiscardOpen(true)
    else router.push("/agentes")
  }

  function confirmDiscard() {
    setDiscardOpen(false)
    router.push("/agentes")
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-app overflow-hidden">
      {/* Header Apple */}
      <header className="bg-bg-surface border-b border-default px-6 md:px-8 py-5 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-tiny text-text-tertiary uppercase tracking-wider font-medium">
              Passo {step} de {TOTAL_STEPS} · {STEP_LABELS[step]}
            </div>
            <h1 className="text-title text-text-primary mt-1">Criar agente</h1>
          </div>
          <button
            onClick={attemptCancel}
            className="text-text-tertiary hover:text-text-primary p-2 rounded-default hover:bg-bg-subtle transition"
            aria-label="Cancelar"
            title="Cancelar (Esc)"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        {/* Barra de progresso sutil */}
        <div className="max-w-3xl mx-auto mt-4 h-[3px] bg-bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-fast"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </header>

      {/* Body — cada step renderiza seu próprio conteúdo + footer fixo */}
      {step === 1 && <StepIdentity onCancel={attemptCancel} />}
      {step === 2 && <StepPersona />}
      {step === 3 && <StepInstructions />}
      {step === 4 && <StepDocuments />}
      {step === 5 && <StepReview />}

      {/* Modal: descartar rascunho */}
      {discardOpen && (
        <DiscardModal onCancel={() => setDiscardOpen(false)} onConfirm={confirmDiscard} />
      )}
    </div>
  )
}

function DiscardModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-bg-surface rounded-xl shadow-lg max-w-md w-full mx-4 p-8">
        <h2 className="text-title text-text-primary">Descartar rascunho?</h2>
        <p className="text-body text-text-secondary leading-relaxed mt-2">
          Você preencheu informações que serão perdidas. Essa ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2 mt-loose">
          <button
            onClick={onCancel}
            className="bg-bg-surface text-text-primary border border-default rounded-default font-medium px-4 py-2 text-body hover:bg-bg-subtle hover:border-strong transition"
          >
            Continuar editando
          </button>
          <button
            onClick={onConfirm}
            className="bg-danger text-white rounded-default font-medium px-4 py-2 text-body hover:bg-red-700 transition"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}
