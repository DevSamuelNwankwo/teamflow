import { useMemo } from 'react'
import { useProjects } from './useProjects'
import { useTeamMembers } from './useTeamMembers'

/** Derives dashboard metrics from already-cached project/member queries rather than a
 *  dedicated endpoint — cheap at this data scale and keeps every number reactive to the
 *  same cache TanStack Query already maintains. */
export function useDashboardStats() {
  const projectsQuery = useProjects()
  const membersQuery = useTeamMembers()

  const stats = useMemo(() => {
    const projects = projectsQuery.data ?? []
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'ACTIVE').length,
      completedProjects: projects.filter((p) => p.status === 'COMPLETED').length,
      memberCount: membersQuery.data?.length ?? 0,
      upcomingDeadlines: [...projects]
        .filter((p) => p.status !== 'COMPLETED')
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
        .slice(0, 5),
    }
  }, [projectsQuery.data, membersQuery.data])

  return {
    ...stats,
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading || membersQuery.isLoading,
    isError: projectsQuery.isError || membersQuery.isError,
    refetch: () => {
      projectsQuery.refetch()
      membersQuery.refetch()
    },
  }
}
