import { supabase } from './supabaseClient'
import { getReadableError } from './errors'
import type { ActivityRow, ActivityType } from '@/types/activity'

interface LogActivityInput {
  type: ActivityType
  actorId: string
  message: string
  projectId?: string | null
  taskId?: string | null
  metadata?: Record<string, unknown>
}

export const activityApi = {
  /** Fire-and-log: called by projectsApi/tasksApi right after a successful mutation.
   *  Failures are swallowed (logged to console) so a broken audit write never rolls back —
   *  or even surfaces an error for — the primary action that already succeeded. See README
   *  "Known Limitations" for the trade-off this implies. */
  async log({ type, actorId, message, projectId, taskId, metadata }: LogActivityInput) {
    const { error } = await supabase.from('activity').insert({
      type,
      actor_id: actorId,
      project_id: projectId ?? null,
      task_id: taskId ?? null,
      message,
      metadata: metadata ?? {},
    })
    if (error) console.error('Failed to record activity:', getReadableError(error))
  },

  async listRecent(limit = 10): Promise<ActivityRow[]> {
    const { data, error } = await supabase
      .from('activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(getReadableError(error))
    return data
  },

  async listForProject(projectId: string, limit = 50): Promise<ActivityRow[]> {
    const { data, error } = await supabase
      .from('activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(getReadableError(error))
    return data
  },
}
