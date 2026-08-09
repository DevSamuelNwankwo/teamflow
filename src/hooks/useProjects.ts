import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/api/projectsApi'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectsApi.list,
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => projectsApi.getById(id as string),
    enabled: Boolean(id),
  })
}
