import type { MemberStatus, PriorityLevel, ProjectStatus, TaskStatus } from '@/types/enums'

/** Single source of truth for how status/priority values are labeled and colored.
 *  StatusBadge / PriorityBadge read exclusively from these maps — nothing else in the
 *  app should hard-code a status/priority label or color. */

interface BadgeStyle {
  label: string
  bg: string
  text: string
}

export const PROJECT_STATUS_STYLES: Record<ProjectStatus, BadgeStyle> = {
  PLANNING: { label: 'Planning', bg: 'bg-status-slate-bg', text: 'text-status-slate-text' },
  ACTIVE: { label: 'Active', bg: 'bg-status-blue-bg', text: 'text-status-blue-text' },
  ON_HOLD: { label: 'On Hold', bg: 'bg-status-amber-bg', text: 'text-status-amber-text' },
  COMPLETED: { label: 'Completed', bg: 'bg-status-green-bg', text: 'text-status-green-text' },
}

export const TASK_STATUS_STYLES: Record<TaskStatus, BadgeStyle> = {
  TODO: { label: 'To Do', bg: 'bg-status-slate-bg', text: 'text-status-slate-text' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-status-blue-bg', text: 'text-status-blue-text' },
  REVIEW: { label: 'Review', bg: 'bg-status-purple-bg', text: 'text-status-purple-text' },
  COMPLETED: { label: 'Completed', bg: 'bg-status-green-bg', text: 'text-status-green-text' },
}

export const PRIORITY_STYLES: Record<PriorityLevel, BadgeStyle> = {
  LOW: { label: 'Low', bg: 'bg-status-slate-bg', text: 'text-status-slate-text' },
  MEDIUM: { label: 'Medium', bg: 'bg-status-blue-bg', text: 'text-status-blue-text' },
  HIGH: { label: 'High', bg: 'bg-status-amber-bg', text: 'text-status-amber-text' },
  CRITICAL: { label: 'Critical', bg: 'bg-status-red-bg', text: 'text-status-red-text' },
}

export const MEMBER_STATUS_STYLES: Record<MemberStatus, BadgeStyle> = {
  ACTIVE: { label: 'Active', bg: 'bg-status-green-bg', text: 'text-status-green-text' },
  INVITED: { label: 'Invited', bg: 'bg-status-amber-bg', text: 'text-status-amber-text' },
  INACTIVE: { label: 'Inactive', bg: 'bg-status-slate-bg', text: 'text-status-slate-text' },
}

/** Kanban column order + display titles — the single place the board layout is defined. */
export const KANBAN_COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'To Do' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'REVIEW', title: 'Review' },
  { status: 'COMPLETED', title: 'Completed' },
]
