"use client"
import { useState } from "react"
import { type Agent, type Instruction, addInstruction, removeInstruction } from "@/lib/agents-api"
import { InstructionsEditor, type InstructionItem } from "@/components/agents/InstructionsEditor"

export function InstructionsTab({
  agent,
  onChange,
}: {
  agent: Agent
  onChange: (next: Agent) => void
}) {
  const [busy, setBusy] = useState(false)

  const items: InstructionItem[] = [...agent.instructions]
    .sort((a, b) => a.order - b.order)
    .map((i) => ({ id: i.id, content: i.content }))

  function patchAgent(next: Instruction[]) {
    onChange({ ...agent, instructions: next })
  }

  async function handleAdd(content: string) {
    setBusy(true)
    try {
      const created = await addInstruction(agent.id, {
        content: content.trim() || "(em branco)",
        order: agent.instructions.length,
      })
      patchAgent([...agent.instructions, created])
    } finally {
      setBusy(false)
    }
  }

  // Update local: sem PATCH no backend nessa Sprint — atualiza só o conteúdo em memória
  // até o usuário salvar pelo "remove + add" caso queira persistir uma alteração.
  function handleUpdate(id: string, content: string) {
    patchAgent(agent.instructions.map((i) => (i.id === id ? { ...i, content } : i)))
  }

  async function handleRemove(id: string) {
    setBusy(true)
    try {
      await removeInstruction(agent.id, id)
      patchAgent(agent.instructions.filter((i) => i.id !== id))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
      <div className="max-w-3xl mx-auto bg-bg-surface border border-default rounded-xl p-6">
        <div className="mb-comfortable">
          <h2 className="text-subtitle text-text-primary">Instruções específicas</h2>
          <p className="text-small text-text-secondary mt-1">
            Regras curtas que esse agente sempre deve seguir. Adicione e remova à vontade.
          </p>
        </div>
        <InstructionsEditor
          items={items}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          saving={busy}
        />
      </div>
    </div>
  )
}
