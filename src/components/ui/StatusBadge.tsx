import { PROJECT_STATUS_STYLES, TASK_STATUS_STYLES } from '@/lib/constants'
import type { ProjectStatus, TaskStatus } from '@/types/enums'
import { cn } from '@/lib/utils'

const badgeBase = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const style = PROJECT_STATUS_STYLES[status]
  return <span className={cn(badgeBase, style.bg, style.text, className)}>{style.label}</span>
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const style = TASK_STATUS_STYLES[status]
  return <span className={cn(badgeBase, style.bg, style.text, className)}>{style.label}</span>
}
