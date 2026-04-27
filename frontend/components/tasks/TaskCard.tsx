"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { TaskColumn, TaskItem } from "@/lib/api"
import { Icon } from "@/components/Icon"
import { PRIORITY_LABEL, dueClass, dueStateOf, fmtDue } from "./_helpers"

export function TaskCard({
  task,
  column,
  onClick,
  isDragOverlay = false,
}: {
  task: TaskItem
  column: TaskColumn | undefined
  onClick?: () => void
  isDragOverlay?: boolean
}) {
  const sortable = useSortable({
    id: task.id,
    data: { type: "task", task },
    disabled: isDragOverlay,
  })

  const isDone = !!column?.is_done_column
  const due = fmtDue(task)
  const dueCls = dueClass(dueStateOf(task))
  const prio = task.priority ? PRIORITY_LABEL[task.priority] : null

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.4 : 1,
      }

  return (
    <div
      ref={isDragOverlay ? undefined : sortable.setNodeRef}
      style={style}
      {...(isDragOverlay ? {} : sortable.attributes)}
      {...(isDragOverlay ? {} : sortable.listeners)}
      onClick={(e) => {
        if (sortable.isDragging) return
        // Distingue click de drag: só dispara se não houve transformação significativa
        e.stopPropagation()
        onClick?.()
      }}
      className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-all select-none ${
        isDragOverlay
          ? "border-indigo-300 ring-2 ring-indigo-200 shadow-lg cursor-grabbing"
          : "border-gray-200 cursor-grab active:cursor-grabbing"
      } ${isDone ? "opacity-60" : ""}`}
    >
      <div
        className={`text-[14px] font-medium text-gray-900 leading-snug ${
          isDone ? "line-through" : ""
        }`}
      >
        {task.title}
      </div>
      {task.description && (
        <div className="text-[12.5px] text-gray-500 mt-1 line-clamp-2 leading-snug">
          {task.description}
        </div>
      )}
      {(due || prio) && (
        <div className="flex items-center gap-3 mt-3 text-[11.5px]">
          {due && (
            <span className={`inline-flex items-center gap-1 ${dueCls}`}>
              <Icon name="calendar" size={11} /> {due}
            </span>
          )}
          {prio && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10.5px] font-semibold ${prio.cls}`}
            >
              <Icon name="flag" size={10} /> {prio.label}
            </span>
          )}
        </div>
      )}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="bg-gray-100 text-gray-600 rounded-md text-[10.5px] px-2 py-0.5 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
