"use client"
import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Icon } from "@/components/Icon"
import type { TaskColumn, TaskItem } from "@/lib/api"
import { TaskCard } from "./TaskCard"
import { TaskColumnHeader } from "./TaskColumnHeader"
import { TaskInlineCreate } from "./TaskInlineCreate"

export function TaskColumnView({
  column,
  tasks,
  onCreateTask,
  onOpenTask,
  onRename,
  onChangeColor,
  onToggleDone,
  onDelete,
}: {
  column: TaskColumn
  tasks: TaskItem[]
  onCreateTask: (title: string) => Promise<void>
  onOpenTask: (task: TaskItem) => void
  onRename: (title: string) => void
  onChangeColor: (color: string | null) => void
  onToggleDone: () => void
  onDelete: () => void
}) {
  const [adding, setAdding] = useState(false)

  const sortable = useSortable({
    id: column.id,
    data: { type: "column", column },
  })

  const droppable = useDroppable({
    id: `col-${column.id}`,
    data: { type: "column", column },
  })

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-[280px] md:w-[320px] shrink-0 snap-center max-h-[calc(100vh-180px)]"
    >
      {column.color && (
        <div className="h-[3px] rounded-t-xl" style={{ backgroundColor: column.color }} />
      )}
      <TaskColumnHeader
        column={column}
        count={tasks.length}
        onRename={onRename}
        onChangeColor={onChangeColor}
        onToggleDone={onToggleDone}
        onDelete={onDelete}
        onAdd={() => setAdding(true)}
        dragHandleProps={{ ...sortable.attributes, ...sortable.listeners }}
      />

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={droppable.setNodeRef}
          className={`px-3 pb-3 flex flex-col gap-2 overflow-y-auto min-h-[60px] ${
            droppable.isOver && tasks.length === 0 ? "bg-indigo-50/30" : ""
          }`}
        >
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              column={column}
              onClick={() => onOpenTask(t)}
            />
          ))}

          {adding && (
            <TaskInlineCreate
              onSubmit={onCreateTask}
              onCancel={() => setAdding(false)}
            />
          )}

          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="text-left text-[12.5px] font-medium text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md flex items-center gap-1"
            >
              <Icon name="plus" size={13} /> Adicionar tarefa
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
