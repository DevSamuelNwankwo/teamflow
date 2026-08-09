import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, type CreateProjectInput, type UpdateProjectInput } from '@/api/projectsApi'
import { useAuth } from '@/contexts/AuthContext'
import { projectKeys } from './useProjects'

function useActor() {
  const { user, profile } = useAuth()
  return { actorId: user?.id ?? '', actorName: profile?.name ?? user?.email ?? 'Someone' }
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const { actorId, actorName } = useActor()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input, actorId, actorName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient()
  const { actorId, actorName } = useActor()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.update(projectId, input, actorId, actorName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  const { actorId, actorName } = useActor()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      projectsApi.delete(id, actorId, actorName, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
