import { CheckCircle2, Circle, FolderKanban, ListChecks, Users } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useRecentActivity } from '@/hooks/useActivity'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard } from '@/components/ui/StatCard'
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart'
import { TaskStatusChart } from '@/components/dashboard/TaskStatusChart'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'

export function DashboardPage() {
  const { profile } = useAuth()
  const stats = useDashboardStats()
  const activity = useRecentActivity(8)

  if (stats.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (stats.isError) {
    return <ErrorState message="Couldn't load your dashboard." onRetry={stats.refetch} />
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
        </h2>
        <p className="text-sm text-text-secondary">Here&apos;s what&apos;s happening across your workspace.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} accent="brand" />
        <StatCard label="Active Projects" value={stats.activeProjects} icon={ListChecks} accent="amber" />
        <StatCard label="Completed Projects" value={stats.completedProjects} icon={CheckCircle2} accent="green" />
        <StatCard label="Team Members" value={stats.memberCount} icon={Users} accent="brand" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Tasks" value={stats.totalTasks} icon={ListChecks} accent="brand" />
        <StatCard label="Completed Tasks" value={stats.completedTasks} icon={CheckCircle2} accent="green" />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} icon={Circle} accent="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border-default bg-surface p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Projects by status</h3>
          <ProjectStatusChart projects={stats.projects} />
        </div>
        <div className="rounded-card border border-border-default bg-surface p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Tasks by status</h3>
          <TaskStatusChart tasks={stats.tasks} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border-default bg-surface p-4 shadow-card">
          <h3 className="mb-1 text-sm font-semibold text-text-primary">Upcoming deadlines</h3>
          <UpcomingDeadlines projects={stats.upcomingDeadlines} />
        </div>

        <div className="rounded-card border border-border-default bg-surface p-4 shadow-card">
          <h3 className="mb-1 text-sm font-semibold text-text-primary">Recent activity</h3>
          <ActivityTimeline
            activities={activity.data}
            isLoading={activity.isLoading}
            isError={activity.isError}
            onRetry={() => activity.refetch()}
          />
        </div>
      </div>
    </div>
  )
}
