import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: ComponentType<{ size?: number | string; className?: string }>
  hint?: string
  accent?: 'brand' | 'green' | 'amber' | 'red'
}

const accentClasses = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300',
  green: 'bg-status-green-bg text-status-green-text',
  amber: 'bg-status-amber-bg text-status-amber-text',
  red: 'bg-status-red-bg text-status-red-text',
}

/** Dashboard metric tile — shared shape for Projects/Tasks/People/Deadlines summaries. */
export function StatCard({ label, value, icon: Icon, hint, accent = 'brand' }: StatCardProps) {
  return (
    <div className="rounded-card border border-border-default bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-control', accentClasses[accent])}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-tertiary">{hint}</p>}
    </div>
  )
}
