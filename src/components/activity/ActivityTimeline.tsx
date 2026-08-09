import { History } from 'lucide-react'
import type { ActivityRow } from '@/types/activity'
import { ActivityItem } from './ActivityItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

interface ActivityTimelineProps {
  activities?: ActivityRow[]
  isLoading?: boolean
  isError?: boolean
  error?: unknown
  onRetry?: () => void
  emptyDescription?: string
}

export function ActivityTimeline({ activities, isLoading, isError, error, onRetry, emptyDescription }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Couldn't load activity." error={error} onRetry={onRetry} />
  }

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description={emptyDescription ?? 'Actions like creating projects and tasks will show up here.'}
      />
    )
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </ul>
  )
}
