import { useRecentActivity } from '@/hooks/useActivity'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'

export function ActivityPage() {
  const { data, isLoading, isError, error, refetch } = useRecentActivity(50)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Activity</h2>
        <p className="text-sm text-text-secondary">
          A running log of project and task changes across the workspace.
        </p>
      </div>

      <div className="rounded-card border border-border-default bg-surface p-4 shadow-card">
        <ActivityTimeline
          activities={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          emptyDescription="Create or update a project or task to see activity appear here."
        />
      </div>
    </div>
  )
}
