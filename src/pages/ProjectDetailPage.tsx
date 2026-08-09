import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, LayoutGrid, Pencil, Trash2 } from 'lucide-react'
import { useProject } from '@/hooks/useProjects'
import { useDeleteProject, useUpdateProject } from '@/hooks/useProjectMutations'
import type { ProjectFormValues } from '@/lib/validation/projectSchema'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { AvatarGroup } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProjectKanbanSection } from '@/components/tasks/ProjectKanbanSection'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { useProjectActivity } from '@/hooks/useActivity'
import { formatDate, formatDueLabel } from '@/lib/formatters'
import { notify } from '@/lib/toast'
import { getReadableError } from '@/api/errors'
import { cn } from '@/lib/utils'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading, isError, error, refetch } = useProject(projectId)
  const updateProject = useUpdateProject(projectId ?? '')
  const deleteProject = useDeleteProject()
  const projectActivity = useProjectActivity(projectId)

  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Couldn't load this project." error={error} onRetry={() => refetch()} />
  }

  if (!project) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="Project not found"
        description="This project may have been deleted or the link is incorrect."
        action={
          <Link to="/app/projects">
            <Button variant="secondary">Back to projects</Button>
          </Link>
        }
      />
    )
  }

  const due = formatDueLabel(project.due_date)

  async function handleUpdate(values: ProjectFormValues) {
    try {
      await updateProject.mutateAsync(values)
      notify.success('Project updated')
      setEditing(false)
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  async function handleDelete() {
    if (!project) return
    try {
      await deleteProject.mutateAsync({ id: project.id, name: project.name })
      notify.success(`Project "${project.name}" deleted`)
      navigate('/app/projects', { replace: true })
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  return (
    <div>
      <Link
        to="/app/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={16} /> Back to projects
      </Link>

      <div className="rounded-card border border-border-default bg-surface p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{project.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              {project.description || 'No description provided.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Pencil size={14} /> Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleting(true)}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Start date</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm text-text-primary">
              <Calendar size={14} /> {formatDate(project.start_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Due date</dt>
            <dd className={cn('mt-1 flex items-center gap-1.5 text-sm', due.overdue ? 'text-status-red-text' : 'text-text-primary')}>
              <Calendar size={14} /> {formatDate(project.due_date)} · {due.label}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Team</dt>
            <dd className="mt-1">
              <AvatarGroup members={project.members} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <ProjectKanbanSection projectId={project.id} projectName={project.name} />
      </div>

      <div className="mt-6 rounded-card border border-border-default bg-surface p-4 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-text-primary">Activity</h3>
        <ActivityTimeline
          activities={projectActivity.data}
          isLoading={projectActivity.isLoading}
          isError={projectActivity.isError}
          error={projectActivity.error}
          onRetry={() => projectActivity.refetch()}
          emptyDescription="Changes to this project and its tasks will show up here."
        />
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit project" size="lg">
        <ProjectForm
          defaultValues={{
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            start_date: project.start_date,
            due_date: project.due_date,
            memberIds: project.members.map((m) => m.id),
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
        />
      </Modal>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        title="Delete project"
        description={`Are you sure you want to delete "${project.name}"? This will also delete all of its tasks and cannot be undone.`}
        confirmLabel="Delete project"
        isLoading={deleteProject.isPending}
      />
    </div>
  )
}
