import { useMemo, useState } from 'react'
import { FolderKanban, Plus, SearchX } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useCreateProject, useDeleteProject, useUpdateProject } from '@/hooks/useProjectMutations'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { filterSortProjects, hasActiveFilters, PROJECT_SORT_OPTIONS } from '@/lib/filterSort'
import { PROJECT_STATUSES, PRIORITY_LEVELS } from '@/types/enums'
import { PROJECT_STATUS_STYLES, PRIORITY_STYLES } from '@/lib/constants'
import type { ProjectWithMembers } from '@/types/project'
import type { ProjectFormValues } from '@/lib/validation/projectSchema'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FilterBar } from '@/components/ui/FilterBar'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'
import { notify } from '@/lib/toast'
import { getReadableError } from '@/api/errors'

type DialogState = { mode: 'create' } | { mode: 'edit'; project: ProjectWithMembers } | null

export function ProjectsPage() {
  const { data: projects, isLoading, isError, refetch } = useProjects()
  const { data: members } = useTeamMembers()
  const { filters, setFilter, clearFilters } = useUrlFilters()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithMembers | null>(null)

  const visibleProjects = useMemo(
    () => (projects ? filterSortProjects(projects, filters) : []),
    [projects, filters],
  )
  const filtersActive = hasActiveFilters(filters)

  const createProject = useCreateProject()
  const updateProject = useUpdateProject(dialog?.mode === 'edit' ? dialog.project.id : '')
  const deleteProject = useDeleteProject()

  async function handleCreate(values: ProjectFormValues) {
    try {
      await createProject.mutateAsync(values)
      notify.success(`Project "${values.name}" created`)
      setDialog(null)
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  async function handleUpdate(values: ProjectFormValues) {
    try {
      await updateProject.mutateAsync(values)
      notify.success(`Project "${values.name}" updated`)
      setDialog(null)
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteProject.mutateAsync({ id: deleteTarget.id, name: deleteTarget.name })
      notify.success(`Project "${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Projects</h2>
          <p className="text-sm text-text-secondary">Manage your team&apos;s active and past projects.</p>
        </div>
        <Button onClick={() => setDialog({ mode: 'create' })}>
          <Plus size={16} /> New project
        </Button>
      </div>

      {!isLoading && !isError && projects && projects.length > 0 && (
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          hasActiveFilters={filtersActive}
          searchPlaceholder="Search projects…"
          statusOptions={PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_STYLES[s].label }))}
          priorityOptions={PRIORITY_LEVELS.map((p) => ({ value: p, label: PRIORITY_STYLES[p].label }))}
          assigneeOptions={(members ?? []).map((m) => ({ value: m.id, label: m.name }))}
          sortOptions={PROJECT_SORT_OPTIONS}
        />
      )}

      {isLoading && <CardSkeletonGrid />}

      {isError && <ErrorState message="Couldn't load projects." onRetry={() => refetch()} />}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks and tracking progress."
          action={<Button onClick={() => setDialog({ mode: 'create' })}>Create your first project</Button>}
        />
      )}

      {!isLoading && !isError && projects && projects.length > 0 && visibleProjects.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No projects match your filters"
          description="Try a different search term or clear the filters to see everything."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {!isLoading && !isError && visibleProjects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setDialog({ mode: 'edit', project })}
              onDelete={() => setDeleteTarget(project)}
            />
          ))}
        </div>
      )}

      <Modal
        open={dialog?.mode === 'create'}
        onClose={() => setDialog(null)}
        title="New project"
        size="lg"
      >
        <ProjectForm onSubmit={handleCreate} onCancel={() => setDialog(null)} submitLabel="Create project" />
      </Modal>

      <Modal
        open={dialog?.mode === 'edit'}
        onClose={() => setDialog(null)}
        title="Edit project"
        size="lg"
      >
        {dialog?.mode === 'edit' && (
          <ProjectForm
            defaultValues={{
              name: dialog.project.name,
              description: dialog.project.description,
              status: dialog.project.status,
              priority: dialog.project.priority,
              start_date: dialog.project.start_date,
              due_date: dialog.project.due_date,
              memberIds: dialog.project.members.map((m) => m.id),
            }}
            onSubmit={handleUpdate}
            onCancel={() => setDialog(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all of its tasks and cannot be undone.`}
        confirmLabel="Delete project"
        isLoading={deleteProject.isPending}
      />
    </div>
  )
}
