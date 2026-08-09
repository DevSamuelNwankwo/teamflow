import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasksApi'

export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
  detail: (id: string) => ['tasks', id] as const,
}

export function useProjectTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId ?? ''),
    queryFn: () => tasksApi.listByProject(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useAllTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: tasksApi.listAll,
  })
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: () => tasksApi.getById(id as string),
    enabled: Boolean(id),
  })
}
