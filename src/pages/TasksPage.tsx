import { Link } from 'react-router-dom'
import { ListChecks } from 'lucide-react'
import { useAllTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { TaskStatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Avatar } from '@/components/ui/Avatar'
import { TaskTags } from '@/components/tasks/TaskTags'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDueLabel } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export function TasksPage() {
  const { data: tasks, isLoading, isError, refetch } = useAllTasks()
  const { data: projects } = useProjects()

  const projectNameById = new Map((projects ?? []).map((p) => [p.id, p.name]))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
        <p className="text-sm text-text-secondary">Every task across all of your projects, in one place.</p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState message="Couldn't load tasks." onRetry={() => refetch()} />}

      {!isLoading && !isError && tasks && tasks.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Open a project and add a task to its Kanban board to see it here."
        />
      )}

      {!isLoading && !isError && tasks && tasks.length > 0 && (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => {
            const due = task.due_date ? formatDueLabel(task.due_date) : null
            return (
              <Link
                key={task.id}
                to={`/app/projects/${task.project_id}`}
                className="flex flex-col gap-2 rounded-card border border-border-default bg-surface p-3 shadow-card hover:shadow-popover sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
                  <p className="truncate text-xs text-text-tertiary">
                    {projectNameById.get(task.project_id) ?? 'Unknown project'}
                  </p>
                  <TaskTags tags={task.tags} className="mt-1 flex flex-wrap gap-1" />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <TaskStatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {due && (
                    <span className={cn('text-xs', due.overdue ? 'font-medium text-status-red-text' : 'text-text-tertiary')}>
                      {due.label}
                    </span>
                  )}
                  {task.assignee && <Avatar name={task.assignee.name} src={task.assignee.avatar_url} size="xs" />}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
