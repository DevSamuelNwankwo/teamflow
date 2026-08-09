import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import type { ProjectWithMembers } from '@/types/project'
import { formatDueLabel } from '@/lib/formatters'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

export function UpcomingDeadlines({ projects }: { projects: ProjectWithMembers[] }) {
  if (projects.length === 0) {
    return <EmptyState icon={CalendarClock} title="No upcoming deadlines" description="Projects with due dates will appear here." />
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {projects.map((project) => {
        const due = formatDueLabel(project.due_date)
        return (
          <li key={project.id}>
            <Link
              to={`/app/projects/${project.id}`}
              className="flex items-center justify-between gap-3 py-2.5 hover:text-brand-600"
            >
              <span className="truncate text-sm text-text-primary">{project.name}</span>
              <span className={cn('shrink-0 text-xs', due.overdue ? 'font-medium text-status-red-text' : 'text-text-tertiary')}>
                {due.label}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
