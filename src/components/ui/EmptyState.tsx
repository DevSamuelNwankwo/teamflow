import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: ComponentType<{ size?: number | string; className?: string }>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Parameterized empty state reused for true-empty lists, no-search-results, empty Kanban
 *  columns, and "coming soon" sections — one visual language for "there's nothing here". */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-default px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-text-tertiary">
        <Icon size={22} />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}
