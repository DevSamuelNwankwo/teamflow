import { Calendar, Pencil, Trash2 } from 'lucide-react'
import type { TaskWithAssignee } from '@/types/task'
import { TaskStatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { TaskTags } from './TaskTags'
import { formatDate, formatDueLabel } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface TaskDetailsProps {
  task: TaskWithAssignee
  onEdit: () => void
  onDelete: () => void
}

export function TaskDetails({ task, onEdit, onDelete }: TaskDetailsProps) {
  const due = task.due_date ? formatDueLabel(task.due_date) : null

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap text-sm text-text-secondary">
        {task.description || 'No description provided.'}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <TaskStatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      <TaskTags tags={task.tags} />

      <dl className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Assignee</dt>
          <dd className="mt-1 flex items-center gap-2 text-sm text-text-primary">
            {task.assignee ? (
              <>
                <Avatar name={task.assignee.name} src={task.assignee.avatar_url} size="xs" />
                {task.assignee.name}
              </>
            ) : (
              <span className="text-text-tertiary">Unassigned</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Due date</dt>
          <dd className={cn('mt-1 flex items-center gap-1.5 text-sm', due?.overdue ? 'text-status-red-text' : 'text-text-primary')}>
            {task.due_date ? (
              <>
                <Calendar size={14} /> {formatDate(task.due_date)}
              </>
            ) : (
              <span className="text-text-tertiary">No due date</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Created</dt>
          <dd className="mt-1 text-sm text-text-primary">{formatDate(task.created_at)}</dd>
        </div>
      </dl>

      <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 size={14} /> Delete
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <Pencil size={14} /> Edit
        </Button>
      </div>
    </div>
  )
}
