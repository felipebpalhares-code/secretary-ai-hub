"use client"
import { ChevronRight } from "lucide-react"
import { useAgentWizard } from "@/stores/agentWizard"
import { InstructionsEditor } from "@/components/agents/InstructionsEditor"
import { WizardFooter } from "./WizardFooter"

export function StepInstructions() {
  const {
    instructions,
    addInstruction,
    updateInstruction,
    removeInstruction,
    reorderInstructions,
    prev,
    next,
  } = useAgentWizard()

  // Filtra brancos no submit pra não persistir vazios.
  const handleNext = () => {
    instructions.filter((i) => !i.content.trim()).forEach((i) => removeInstruction(i.id))
    next()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-loose">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display text-text-primary">Quais regras esse agente deve seguir?</h1>
          <p className="text-body text-text-secondary mt-2">
            Liste instruções específicas. Você pode reordenar arrastando.
          </p>

          <div className="mt-loose">
            <InstructionsEditor
              items={instructions}
              onAdd={addInstruction}
              onUpdate={updateInstruction}
              onRemove={removeInstruction}
              onReorder={reorderInstructions}
            />
          </div>
        </div>
      </div>

      <WizardFooter
        onBack={prev}
        extras={
          <button
            type="button"
            onClick={next}
            className="text-small text-text-secondary hover:text-text-primary px-2 py-1 rounded-default hover:bg-bg-subtle transition"
          >
            Pular este passo
          </button>
        }
      >
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition"
        >
          Continuar
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </WizardFooter>
    </div>
  )
}
