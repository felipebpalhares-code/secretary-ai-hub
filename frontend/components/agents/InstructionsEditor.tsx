"use client"
import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react"

export type InstructionItem = { id: string; content: string }

const EXAMPLES = [
  "Sempre responda em português formal",
  "Cite a fonte quando referenciar leis ou artigos",
  "Faça perguntas de esclarecimento antes de dar parecer definitivo",
  "Use bullet points pra listas com mais de 3 itens",
]

type Props = {
  items: InstructionItem[]
  onAdd: (content: string) => void
  onUpdate: (id: string, content: string) => void
  onRemove: (id: string) => void
  /** Quando definido, habilita drag-and-drop visual e chama com a nova ordem de ids. */
  onReorder?: (ids: string[]) => void
  /** Loading flag pra desabilitar interações enquanto salva (uso na aba Instruções). */
  saving?: boolean
}

export function InstructionsEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  saving,
}: Props) {
  const [showExamples, setShowExamples] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  function handleDragEnd(e: DragEndEvent) {
    if (!onReorder || !e.over || e.active.id === e.over.id) return
    const oldIndex = items.findIndex((i) => i.id === e.active.id)
    const newIndex = items.findIndex((i) => i.id === e.over!.id)
    onReorder(arrayMove(items, oldIndex, newIndex).map((i) => i.id))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Cabeçalho com Ver exemplos */}
      <div className="flex items-center justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExamples((s) => !s)}
            className="inline-flex items-center gap-1 text-small text-text-secondary hover:text-text-primary px-2 py-1 rounded-default hover:bg-bg-subtle transition"
          >
            Ver exemplos
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>
          {showExamples && (
            <div className="absolute right-0 top-full mt-1 z-10 w-80 bg-bg-surface border border-default rounded-md shadow-md overflow-hidden">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    onAdd(ex)
                    setShowExamples(false)
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-bg-subtle transition border-b border-default last:border-0 text-body text-text-primary"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <div className="bg-bg-surface border border-dashed border-default rounded-md p-8 text-center">
          <p className="text-body text-text-secondary">
            Nenhuma instrução ainda. Adicione regras específicas que esse agente deve seguir.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  draggable={Boolean(onReorder)}
                  saving={saving}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        onClick={() => onAdd("")}
        disabled={saving}
        className="inline-flex items-center gap-2 self-start text-small text-text-secondary hover:text-text-primary px-3 py-2 rounded-default border border-dashed border-default hover:border-strong hover:bg-bg-subtle transition disabled:opacity-50"
      >
        <Plus size={14} strokeWidth={1.5} />
        Adicionar instrução
      </button>
    </div>
  )
}

function Row({
  item,
  draggable,
  saving,
  onUpdate,
  onRemove,
}: {
  item: InstructionItem
  draggable: boolean
  saving?: boolean
  onUpdate: (id: string, content: string) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !draggable,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="bg-bg-surface border border-default rounded-md p-3 flex items-start gap-2"
    >
      {draggable && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
          className="text-text-tertiary hover:text-text-secondary cursor-grab active:cursor-grabbing p-1 mt-1"
        >
          <GripVertical size={16} strokeWidth={1.5} />
        </button>
      )}

      <textarea
        value={item.content}
        onChange={(e) => onUpdate(item.id, e.target.value)}
        rows={3}
        placeholder="Ex: Cite o artigo da lei quando referenciar."
        disabled={saving}
        className="flex-1 bg-transparent border-0 text-body text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-0 disabled:opacity-50"
      />

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={saving}
        aria-label="Remover instrução"
        className="text-text-tertiary hover:text-danger p-1.5 rounded-default hover:bg-danger-subtle transition disabled:opacity-50"
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}
