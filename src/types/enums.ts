// Shared literal union types mirroring the Postgres enums in supabase/migrations/0001_init.sql.
// Single source of truth for valid values — components should never compare against raw strings.

export const PROJECT_STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number]

export const MEMBER_STATUSES = ['ACTIVE', 'INVITED', 'INACTIVE'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]
