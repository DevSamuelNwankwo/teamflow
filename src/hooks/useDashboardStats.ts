import { useMemo } from 'react'
import { useProjects } from './useProjects'
import { useTeamMembers } from './useTeamMembers'
import { useAllTasks } from './useTasks'

/** Derives dashboard metrics from already-cached project/task/member queries rather than a
 *  dedicated endpoint — cheap at this data scale and keeps every number reactive to the
 *  same cache TanStack Query already maintains. */
export function useDashboardStats() {
  const projectsQuery = useProjects()
  const membersQuery = useTeamMembers()
  const tasksQuery = useAllTasks()

  const stats = useMemo(() => {
    const projects = projectsQuery.data ?? []
    const tasks = tasksQuery.data ?? []
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'ACTIVE').length,
      completedProjects: projects.filter((p) => p.status === 'COMPLETED').length,
      memberCount: membersQuery.data?.length ?? 0,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'COMPLETED').length,
      pendingTasks: tasks.filter((t) => t.status !== 'COMPLETED').length,
      upcomingDeadlines: [...projects]
        .filter((p) => p.status !== 'COMPLETED')
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
        .slice(0, 5),
    }
  }, [projectsQuery.data, membersQuery.data, tasksQuery.data])

  return {
    ...stats,
    projects: projectsQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    isLoading: projectsQuery.isLoading || membersQuery.isLoading || tasksQuery.isLoading,
    isError: projectsQuery.isError || membersQuery.isError || tasksQuery.isError,
    error: projectsQuery.error ?? membersQuery.error ?? tasksQuery.error,
    refetch: () => {
      projectsQuery.refetch()
      membersQuery.refetch()
      tasksQuery.refetch()
    },
  }
}
