import { differenceInCalendarDays, format, formatDistanceToNow, isPast } from 'date-fns'

export function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'MMM d, yyyy')
}

export function formatRelativeTime(dateStr: string) {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

/** "Due in 3 days" / "Due today" / "Overdue by 2 days" — used on ProjectCard, TaskCard, and the
 *  dashboard's upcoming-deadlines widget. */
export function formatDueLabel(dateStr: string): { label: string; overdue: boolean } {
  const date = new Date(dateStr)
  const days = differenceInCalendarDays(date, new Date())

  if (days === 0) return { label: 'Due today', overdue: false }
  if (days > 0) return { label: `Due in ${days} day${days === 1 ? '' : 's'}`, overdue: false }
  return { label: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`, overdue: isPast(date) }
}
