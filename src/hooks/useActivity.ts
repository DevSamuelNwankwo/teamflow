import { useQuery } from '@tanstack/react-query'
import { activityApi } from '@/api/activityApi'

export function useRecentActivity(limit = 8) {
  return useQuery({
    queryKey: ['activity', 'recent', limit],
    queryFn: () => activityApi.listRecent(limit),
  })
}

export function useProjectActivity(projectId: string | undefined) {
  return useQuery({
    queryKey: ['activity', 'project', projectId],
    queryFn: () => activityApi.listForProject(projectId as string),
    enabled: Boolean(projectId),
  })
}
