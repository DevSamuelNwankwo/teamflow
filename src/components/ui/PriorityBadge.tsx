import { PRIORITY_STYLES } from '@/lib/constants'
import type { PriorityLevel } from '@/types/enums'
import { cn } from '@/lib/utils'

const DOT_COLORS: Record<PriorityLevel, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-amber-500',
  CRITICAL: 'bg-red-500',
}

/** Always paired with a text label, never color alone, per accessibility requirements. */
export function PriorityBadge({ priority, className }: { priority: PriorityLevel; className?: string }) {
  const style = PRIORITY_STYLES[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT_COLORS[priority])} aria-hidden="true" />
      {style.label}
    </span>
  )
}
