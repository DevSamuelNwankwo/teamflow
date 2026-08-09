import type { Database } from './database.types'

export type ActivityRow = Database['public']['Tables']['activity']['Row']

export type ActivityType =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_STATUS_CHANGED'
  | 'PROJECT_COMPLETED'
  | 'PROJECT_DELETED'
  | 'PROJECT_MEMBER_ADDED'
  | 'PROJECT_MEMBER_REMOVED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_ASSIGNED'
  | 'TASK_UNASSIGNED'
  | 'TASK_COMPLETED'
  | 'TASK_DELETED'
