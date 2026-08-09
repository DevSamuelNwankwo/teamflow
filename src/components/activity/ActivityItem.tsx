import { CheckCircle2, FolderPlus, Pencil, Trash2, UserPlus, type LucideIcon } from 'lucide-react'
import type { ActivityRow, ActivityType } from '@/types/activity'
import { formatRelativeTime } from '@/lib/formatters'

const ICONS: Record<ActivityType, LucideIcon> = {
  PROJECT_CREATED: FolderPlus,
  PROJECT_UPDATED: Pencil,
  PROJECT_STATUS_CHANGED: Pencil,
  PROJECT_COMPLETED: CheckCircle2,
  PROJECT_DELETED: Trash2,
  PROJECT_MEMBER_ADDED: UserPlus,
  PROJECT_MEMBER_REMOVED: Trash2,
  TASK_CREATED: FolderPlus,
  TASK_UPDATED: Pencil,
  TASK_STATUS_CHANGED: Pencil,
  TASK_ASSIGNED: UserPlus,
  TASK_UNASSIGNED: Trash2,
  TASK_COMPLETED: CheckCircle2,
  TASK_DELETED: Trash2,
}

export function ActivityItem({ activity }: { activity: ActivityRow }) {
  const Icon = ICONS[activity.type as ActivityType] ?? Pencil

  return (
    <li className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-text-secondary">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary">{activity.message}</p>
        <p className="text-xs text-text-tertiary">{formatRelativeTime(activity.created_at)}</p>
      </div>
    </li>
  )
}
