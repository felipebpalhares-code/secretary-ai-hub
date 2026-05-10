"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pause, Play, Trash2 } from "lucide-react"
import { type Agent, deleteAgent, updateAgent } from "@/lib/agents-api"
import { AgentAvatar } from "./AgentAvatar"
import { StatusPill } from "./StatusPill"
import { PermissionGate } from "@/components/auth/PermissionGate"

export function AgentDetailHeader({
  agent,
  onChange,
}: {
  agent: Agent
  onChange: (next: Agent) => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function togglePause() {
    if (busy) return
    setBusy(true)
    try {
      const nextStatus = agent.status === "active" ? "paused" : "active"
      const next = await updateAgent(agent.id, { status: nextStatus })
      onChange(next)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteAgent(agent.id)
      router.push("/agentes")
    } finally {
      setBusy(false)
    }
  }

  const isPaused = agent.status === "paused"

  return (
    <>
      <header className="bg-bg-surface border-b border-default px-6 md:px-8 py-5 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <AgentAvatar name={agent.name} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-title text-text-primary truncate">{agent.name}</h1>
              <StatusPill status={agent.status} />
            </div>
            <div className="text-body text-text-secondary truncate mt-0.5">{agent.role}</div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PermissionGate module="agentes" action="editar">
              <button
                type="button"
                onClick={togglePause}
                disabled={busy || agent.status === "draft"}
                title={agent.status === "draft" ? "Disponível após primeira ativação" : undefined}
                className="inline-flex items-center gap-2 bg-bg-surface text-text-primary border border-default rounded-default px-3 py-2 text-small font-medium hover:bg-bg-subtle hover:border-strong transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaused ? <Play size={14} strokeWidth={1.5} /> : <Pause size={14} strokeWidth={1.5} />}
                {isPaused ? "Ativar" : "Pausar"}
              </button>
            </PermissionGate>
            <PermissionGate module="agentes" action="deletar">
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={busy}
                className="inline-flex items-center gap-2 bg-bg-surface text-danger border border-default rounded-default px-3 py-2 text-small font-medium hover:bg-danger-subtle hover:border-strong transition disabled:opacity-50"
              >
                <Trash2 size={14} strokeWidth={1.5} />
                Excluir
              </button>
            </PermissionGate>
          </div>
        </div>
      </header>

      {deleteOpen && (
        <DeleteModal
          name={agent.name}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          busy={busy}
        />
      )}
    </>
  )
}

function DeleteModal({
  name,
  onCancel,
  onConfirm,
  busy,
}: {
  name: string
  onCancel: () => void
  onConfirm: () => void
  busy: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-bg-surface rounded-xl shadow-lg max-w-md w-full mx-4 p-8">
        <h2 className="text-title text-text-primary">Excluir agente?</h2>
        <p className="text-body text-text-secondary leading-relaxed mt-2">
          <strong className="text-text-primary">{name}</strong> e todos os documentos, instruções,
          conversas e webhooks dele serão apagados. Não pode ser desfeito.
        </p>
        <div className="flex justify-end gap-2 mt-loose">
          <button
            onClick={onCancel}
            disabled={busy}
            className="bg-bg-surface text-text-primary border border-default rounded-default font-medium px-4 py-2 text-body hover:bg-bg-subtle hover:border-strong transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="bg-danger text-white rounded-default font-medium px-4 py-2 text-body hover:bg-red-700 transition disabled:opacity-50"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
