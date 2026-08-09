import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, type CreateTaskInput, type ReorderUpdate, type UpdateTaskInput } from '@/api/tasksApi'
import { useAuth } from '@/contexts/AuthContext'
import { taskKeys } from './useTasks'
import { activityKeys } from './useActivity'
import { notify } from '@/lib/toast'
import { getReadableError } from '@/api/errors'
import type { TaskWithAssignee } from '@/types/task'

function useActor() {
  const { user, profile } = useAuth()
  return { actorId: user?.id ?? '', actorName: profile?.name ?? user?.email ?? 'Someone' }
}

export function useCreateTask(projectId: string, projectName: string) {
  const queryClient = useQueryClient()
  const { actorId, actorName } = useActor()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input, actorId, actorName, projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()
  const { actorId, actorName } = useActor()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      tasksApi.update(id, input, actorId, actorName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  const { actorId, actorName } = useActor()

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      tasksApi.delete(id, actorId, actorName, title, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

interface ReorderPayload {
  updates: ReorderUpdate[]
  movedTaskId: string
}

/** Backs the Kanban drag-and-drop. Applies the new column/position to the cached task list
 *  immediately (so the card visually lands where it was dropped with no lag), then persists —
 *  rolling the optimistic change back and surfacing a toast if the write fails. */
export function useReorderTasks(projectId: string) {
  const queryClient = useQueryClient()
  const { actorId, actorName } = useActor()
  const queryKey = taskKeys.byProject(projectId)

  return useMutation({
    mutationFn: ({ updates, movedTaskId }: ReorderPayload) =>
      tasksApi.reorder(updates, movedTaskId, actorId, actorName),

    onMutate: async ({ updates }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<TaskWithAssignee[]>(queryKey)

      if (previousTasks) {
        const updateMap = new Map(updates.map((u) => [u.id, u]))
        const next = previousTasks
          .map((task) => {
            const update = updateMap.get(task.id)
            return update ? { ...task, status: update.status, position: update.position } : task
          })
          .sort((a, b) => a.position - b.position)
        queryClient.setQueryData(queryKey, next)
      }

      return { previousTasks }
    },

    onError: (error, _payload, context) => {
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks)
      notify.error(getReadableError(error) || "Couldn't move the task — it's been reverted.")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}
