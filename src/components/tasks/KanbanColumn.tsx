import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { TaskWithAssignee } from '@/types/task'
import type { TaskStatus } from '@/types/enums'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  tasks: TaskWithAssignee[]
  onTaskClick: (task: TaskWithAssignee) => void
}

export function KanbanColumn({ status, title, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } })

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-card bg-surface-sunken">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-24 flex-1 flex-col gap-2 rounded-card p-2 pt-0 transition-colors',
            isOver && 'bg-brand-50 dark:bg-brand-600/10',
          )}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-control border border-dashed border-border-default px-3 py-6 text-center text-xs text-text-tertiary">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
