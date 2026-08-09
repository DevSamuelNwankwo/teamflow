import type { Database } from './database.types'
import type { Profile } from './profile'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

/** Task row with its assignee joined in — what the board/list/detail views actually render. */
export interface TaskWithAssignee extends Task {
  assignee: Profile | null
}
