import type { ProjectWithMembers } from '@/types/project'
import type { TaskWithAssignee } from '@/types/task'

export interface EntityFilters {
  search: string
  status: string
  priority: string
  assignee: string
  sort: string
}

// Must match one of *_SORT_OPTIONS' values below — the <select>'s displayed option and the
// value filterSortProjects/filterSortTasks actually apply have to agree, or the dropdown shows
// one sort while the list is silently ordered by another.
const DEFAULT_SORT = 'created_at-desc'

export const DEFAULT_FILTERS: EntityFilters = {
  search: '',
  status: '',
  priority: '',
  assignee: '',
  sort: DEFAULT_SORT,
}

export const PROJECT_SORT_OPTIONS = [
  { value: 'due_date-asc', label: 'Due date (soonest)' },
  { value: 'due_date-desc', label: 'Due date (latest)' },
  { value: 'created_at-desc', label: 'Newest first' },
  { value: 'created_at-asc', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'priority-desc', label: 'Priority (high to low)' },
]

export const TASK_SORT_OPTIONS = [
  { value: 'due_date-asc', label: 'Due date (soonest)' },
  { value: 'due_date-desc', label: 'Due date (latest)' },
  { value: 'created_at-desc', label: 'Newest first' },
  { value: 'created_at-asc', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title (A–Z)' },
  { value: 'priority-desc', label: 'Priority (high to low)' },
]

const PRIORITY_RANK: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }

/** Pure filter+sort for the Projects list — shared shape with filterSortTasks so both pages'
 *  filter bars behave identically even though they're separate components. */
export function filterSortProjects(projects: ProjectWithMembers[], filters: EntityFilters): ProjectWithMembers[] {
  const search = filters.search.trim().toLowerCase()

  let result = projects.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search) && !p.description.toLowerCase().includes(search)) {
      return false
    }
    if (filters.status && p.status !== filters.status) return false
    if (filters.priority && p.priority !== filters.priority) return false
    if (filters.assignee && !p.members.some((m) => m.id === filters.assignee)) return false
    return true
  })

  const [key, direction] = (filters.sort || 'created_at-desc').split('-')
  result = [...result].sort((a, b) => {
    let cmp = 0
    if (key === 'due_date') cmp = a.due_date.localeCompare(b.due_date)
    else if (key === 'created_at') cmp = a.created_at.localeCompare(b.created_at)
    else if (key === 'name') cmp = a.name.localeCompare(b.name)
    else if (key === 'priority') cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    return direction === 'desc' ? -cmp : cmp
  })

  return result
}

export function filterSortTasks(tasks: TaskWithAssignee[], filters: EntityFilters): TaskWithAssignee[] {
  const search = filters.search.trim().toLowerCase()

  let result = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search) && !t.description.toLowerCase().includes(search)) {
      return false
    }
    if (filters.status && t.status !== filters.status) return false
    if (filters.priority && t.priority !== filters.priority) return false
    if (filters.assignee) {
      if (filters.assignee === 'unassigned' ? t.assigned_member_id !== null : t.assigned_member_id !== filters.assignee) {
        return false
      }
    }
    return true
  })

  const [key, direction] = (filters.sort || 'created_at-desc').split('-')
  result = [...result].sort((a, b) => {
    let cmp = 0
    if (key === 'due_date') cmp = (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')
    else if (key === 'created_at') cmp = a.created_at.localeCompare(b.created_at)
    else if (key === 'title') cmp = a.title.localeCompare(b.title)
    else if (key === 'priority') cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    return direction === 'desc' ? -cmp : cmp
  })

  return result
}

export function hasActiveFilters(filters: EntityFilters): boolean {
  return Boolean(filters.search || filters.status || filters.priority || filters.assignee)
}
