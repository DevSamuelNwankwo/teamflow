import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ListChecks, SearchX } from 'lucide-react'
import { useAllTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { filterSortTasks, hasActiveFilters, TASK_SORT_OPTIONS } from '@/lib/filterSort'
import { TASK_STATUSES, PRIORITY_LEVELS } from '@/types/enums'
import { TASK_STATUS_STYLES, PRIORITY_STYLES } from '@/lib/constants'
import { TaskStatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Avatar } from '@/components/ui/Avatar'
import { TaskTags } from '@/components/tasks/TaskTags'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDueLabel } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export function TasksPage() {
  const { data: tasks, isLoading, isError, refetch } = useAllTasks()
  const { data: projects } = useProjects()
  const { data: members } = useTeamMembers()
  const { filters, setFilter, clearFilters } = useUrlFilters()

  const projectNameById = new Map((projects ?? []).map((p) => [p.id, p.name]))
  const visibleTasks = useMemo(() => (tasks ? filterSortTasks(tasks, filters) : []), [tasks, filters])
  const filtersActive = hasActiveFilters(filters)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
        <p className="text-sm text-text-secondary">Every task across all of your projects, in one place.</p>
      </div>

      {!isLoading && !isError && tasks && tasks.length > 0 && (
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          hasActiveFilters={filtersActive}
          searchPlaceholder="Search tasks…"
          statusOptions={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_STYLES[s].label }))}
          priorityOptions={PRIORITY_LEVELS.map((p) => ({ value: p, label: PRIORITY_STYLES[p].label }))}
          assigneeOptions={[
            { value: 'unassigned', label: 'Unassigned' },
            ...(members ?? []).map((m) => ({ value: m.id, label: m.name })),
          ]}
          sortOptions={TASK_SORT_OPTIONS}
        />
      )}

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

      {!isLoading && !isError && tasks && tasks.length > 0 && visibleTasks.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No tasks match your filters"
          description="Try a different search term or clear the filters to see everything."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {!isLoading && !isError && visibleTasks.length > 0 && (
        <div className="flex flex-col gap-2">
          {visibleTasks.map((task) => {
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
