"use client"
import { useState } from "react"
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-[280px] md:w-[320px] shrink-0 snap-center max-h-[calc(100vh-180px)]">
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
      />

      <div className="px-3 pb-3 flex flex-col gap-2 overflow-y-auto">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} column={column} onClick={() => onOpenTask(t)} />
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
    </div>
  )
}
