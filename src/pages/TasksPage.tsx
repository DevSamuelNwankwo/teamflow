import { ListChecks } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export function TasksPage() {
  return (
    <EmptyState
      icon={ListChecks}
      title="Cross-project tasks are coming soon"
      description="This view will list every task assigned across your projects, with search, filters, and sorting. Open a project to manage its Kanban board in the meantime."
    />
  )
}
