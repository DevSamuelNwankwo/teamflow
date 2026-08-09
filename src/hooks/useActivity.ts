import { useQuery } from '@tanstack/react-query'
import { activityApi } from '@/api/activityApi'

// Shared root key so project/task mutation hooks can invalidate every activity view (recent
// feed + all project-scoped feeds) with one `invalidateQueries({ queryKey: activityKeys.all })`
// call — TanStack Query matches any query key that starts with this prefix.
export const activityKeys = {
  all: ['activity'] as const,
}

export function useRecentActivity(limit = 8) {
  return useQuery({
    queryKey: [...activityKeys.all, 'recent', limit],
    queryFn: () => activityApi.listRecent(limit),
  })
}

export function useProjectActivity(projectId: string | undefined) {
  return useQuery({
    queryKey: [...activityKeys.all, 'project', projectId],
    queryFn: () => activityApi.listForProject(projectId as string),
    enabled: Boolean(projectId),
  })
}
