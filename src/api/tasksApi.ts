import { supabase } from './supabaseClient'
import { getReadableError } from './errors'
import { activityApi } from './activityApi'
import type { Profile } from '@/types/profile'
import type { Task, TaskInsert, TaskUpdate, TaskWithAssignee } from '@/types/task'
import type { TaskStatus } from '@/types/enums'

interface TaskRowWithAssignee extends Task {
  profiles: Profile | null
}

function toTaskWithAssignee(row: TaskRowWithAssignee): TaskWithAssignee {
  const { profiles, ...task } = row
  return { ...task, assignee: profiles }
}

const TASK_WITH_ASSIGNEE_SELECT = '*, profiles!tasks_assigned_member_id_fkey(*)'

export interface CreateTaskInput extends Omit<TaskInsert, 'position'> {}
export interface UpdateTaskInput extends TaskUpdate {}

/** One row's new status/position after a Kanban drag — used to persist a whole column
 *  reorder (or a cross-column move) in a single batch write. */
export interface ReorderUpdate {
  id: string
  status: TaskStatus
  position: number
}

export const tasksApi = {
  async listByProject(projectId: string): Promise<TaskWithAssignee[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_WITH_ASSIGNEE_SELECT)
      .eq('project_id', projectId)
      .order('position', { ascending: true })
    if (error) throw new Error(getReadableError(error))
    return (data as unknown as TaskRowWithAssignee[]).map(toTaskWithAssignee)
  },

  async listAll(): Promise<TaskWithAssignee[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_WITH_ASSIGNEE_SELECT)
      .order('created_at', { ascending: false })
    if (error) throw new Error(getReadableError(error))
    return (data as unknown as TaskRowWithAssignee[]).map(toTaskWithAssignee)
  },

  async getById(id: string): Promise<TaskWithAssignee | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_WITH_ASSIGNEE_SELECT)
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(getReadableError(error))
    return data ? toTaskWithAssignee(data as unknown as TaskRowWithAssignee) : null
  },

  async create(
    input: CreateTaskInput,
    actorId: string,
    actorName: string,
    projectName: string,
  ): Promise<TaskWithAssignee> {
    const { data: maxPositionRow } = await supabase
      .from('tasks')
      .select('position')
      .eq('project_id', input.project_id)
      .eq('status', input.status ?? 'TODO')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextPosition = (maxPositionRow?.position ?? 0) + 1000

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ ...input, created_by: actorId, position: nextPosition })
      .select()
      .single()
    if (error) throw new Error(getReadableError(error))

    await activityApi.log({
      type: 'TASK_CREATED',
      actorId,
      projectId: task.project_id,
      taskId: task.id,
      message: `${actorName} created task "${task.title}" in ${projectName}`,
    })

    if (task.assigned_member_id) {
      await activityApi.log({
        type: 'TASK_ASSIGNED',
        actorId,
        projectId: task.project_id,
        taskId: task.id,
        message: `${actorName} assigned task "${task.title}"`,
      })
    }

    const full = await tasksApi.getById(task.id)
    if (!full) throw new Error('Task was created but could not be reloaded.')
    return full
  },

  async update(
    id: string,
    input: UpdateTaskInput,
    actorId: string,
    actorName: string,
  ): Promise<TaskWithAssignee> {
    const previous = await tasksApi.getById(id)

    const { error } = await supabase.from('tasks').update(input).eq('id', id)
    if (error) throw new Error(getReadableError(error))

    const full = await tasksApi.getById(id)
    if (!full) throw new Error('Task was updated but could not be reloaded.')

    if (previous && input.status && previous.status !== input.status) {
      await activityApi.log({
        type: input.status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED',
        actorId,
        projectId: full.project_id,
        taskId: full.id,
        message: `${actorName} moved task "${full.title}" to ${input.status.replace('_', ' ')}`,
        metadata: { from: previous.status, to: input.status },
      })
    } else if (previous && 'assigned_member_id' in input && previous.assigned_member_id !== input.assigned_member_id) {
      await activityApi.log({
        type: input.assigned_member_id ? 'TASK_ASSIGNED' : 'TASK_UNASSIGNED',
        actorId,
        projectId: full.project_id,
        taskId: full.id,
        message: input.assigned_member_id
          ? `${actorName} assigned task "${full.title}" to ${full.assignee?.name ?? 'a teammate'}`
          : `${actorName} unassigned task "${full.title}"`,
      })
    } else {
      await activityApi.log({
        type: 'TASK_UPDATED',
        actorId,
        projectId: full.project_id,
        taskId: full.id,
        message: `${actorName} updated task "${full.title}"`,
      })
    }

    return full
  },

  /** Persists a Kanban drag: batch-writes status/position for every task in the affected
   *  column(s), then logs a single activity entry for the task that actually moved. */
  async reorder(updates: ReorderUpdate[], movedTaskId: string, actorId: string, actorName: string): Promise<void> {
    const movedTask = await tasksApi.getById(movedTaskId)
    const moved = updates.find((u) => u.id === movedTaskId)

    await Promise.all(
      updates.map(({ id, status, position }) =>
        supabase.from('tasks').update({ status, position }).eq('id', id).then(({ error }) => {
          if (error) throw new Error(getReadableError(error))
        }),
      ),
    )

    if (movedTask && moved && movedTask.status !== moved.status) {
      await activityApi.log({
        type: moved.status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED',
        actorId,
        projectId: movedTask.project_id,
        taskId: movedTask.id,
        message: `${actorName} moved task "${movedTask.title}" to ${moved.status.replace('_', ' ')}`,
        metadata: { from: movedTask.status, to: moved.status },
      })
    }
  },

  async delete(id: string, actorId: string, actorName: string, taskTitle: string, projectId: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw new Error(getReadableError(error))

    await activityApi.log({
      type: 'TASK_DELETED',
      actorId,
      projectId,
      message: `${actorName} deleted task "${taskTitle}"`,
    })
  },
}
