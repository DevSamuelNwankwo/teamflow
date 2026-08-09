import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar } from 'lucide-react'
import type { TaskWithAssignee } from '@/types/task'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Avatar } from '@/components/ui/Avatar'
import { TaskTags } from './TaskTags'
import { formatDueLabel } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: TaskWithAssignee
  onClick: () => void
}

/** The single card type rendered in every Kanban column — draggable via dnd-kit's sortable
 *  hook, which wires up both pointer drag and the keyboard-sensor equivalent. */
export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  })

  const due = task.due_date ? formatDueLabel(task.due_date) : null

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onKeyDown={(e) => {
        // `listeners.onKeyDown` is dnd-kit's KeyboardSensor activator (Space to lift/drop,
        // arrows to move) — it MUST still run, or spreading a JSX prop after {...listeners}
        // would silently replace it and break keyboard drag entirely.
        listeners?.onKeyDown?.(e)
        if (e.key === 'Enter') onClick()
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Press space to move, enter to open.`}
      className={cn(
        'cursor-grab rounded-card border border-border-default bg-surface p-3 text-left shadow-card transition-shadow active:cursor-grabbing hover:shadow-popover',
        isDragging && 'opacity-50',
      )}
    >
      <p className="mb-2 text-sm font-medium text-text-primary">{task.title}</p>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
      </div>

      <TaskTags tags={task.tags} className="mb-2 flex flex-wrap gap-1" />

      <div className="flex items-center justify-between pt-1">
        {due ? (
          <span className={cn('flex items-center gap-1 text-xs', due.overdue ? 'text-status-red-text' : 'text-text-tertiary')}>
            <Calendar size={12} /> {due.label}
          </span>
        ) : (
          <span />
        )}
        {task.assignee && <Avatar name={task.assignee.name} src={task.assignee.avatar_url} size="xs" />}
      </div>
    </div>
  )
}
