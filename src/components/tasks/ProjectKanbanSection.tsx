import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjectTasks } from '@/hooks/useTasks'
import { useCreateTask, useDeleteTask, useUpdateTask } from '@/hooks/useTaskMutations'
import type { TaskWithAssignee } from '@/types/task'
import type { TaskFormValues } from '@/lib/validation/taskSchema'
import { KanbanBoard } from './KanbanBoard'
import { TaskForm } from './TaskForm'
import { TaskDetails } from './TaskDetails'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { notify } from '@/lib/toast'
import { getReadableError } from '@/api/errors'

type DialogState = { mode: 'create' } | { mode: 'view'; task: TaskWithAssignee } | { mode: 'edit'; task: TaskWithAssignee } | null

function toTaskInput(values: TaskFormValues) {
  return {
    title: values.title,
    description: values.description,
    status: values.status,
    priority: values.priority,
    due_date: values.due_date || null,
    assigned_member_id: values.assigned_member_id || null,
    tags: values.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  }
}

export function ProjectKanbanSection({ projectId, projectName }: { projectId: string; projectName: string }) {
  const { data: tasks, isLoading, isError, refetch } = useProjectTasks(projectId)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskWithAssignee | null>(null)

  const createTask = useCreateTask(projectId, projectName)
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)

  async function handleCreate(values: TaskFormValues) {
    try {
      await createTask.mutateAsync({ project_id: projectId, ...toTaskInput(values) })
      notify.success(`Task "${values.title}" created`)
      setDialog(null)
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  async function handleUpdate(values: TaskFormValues) {
    if (dialog?.mode !== 'edit') return
    try {
      await updateTask.mutateAsync({ id: dialog.task.id, input: toTaskInput(values) })
      notify.success(`Task "${values.title}" updated`)
      setDialog(null)
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteTask.mutateAsync({ id: deleteTarget.id, title: deleteTarget.title })
      notify.success(`Task "${deleteTarget.title}" deleted`)
      setDeleteTarget(null)
      setDialog(null)
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-72 shrink-0" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState message="Couldn't load tasks for this project." onRetry={() => refetch()} />
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Board</h3>
        <Button size="sm" onClick={() => setDialog({ mode: 'create' })}>
          <Plus size={14} /> New task
        </Button>
      </div>

      <KanbanBoard
        projectId={projectId}
        tasks={tasks ?? []}
        onTaskClick={(task) => setDialog({ mode: 'view', task })}
      />

      <Modal open={dialog?.mode === 'create'} onClose={() => setDialog(null)} title="New task" size="lg">
        <TaskForm onSubmit={handleCreate} onCancel={() => setDialog(null)} submitLabel="Create task" />
      </Modal>

      <Modal
        open={dialog?.mode === 'view'}
        onClose={() => setDialog(null)}
        title={dialog?.mode === 'view' ? dialog.task.title : ''}
        size="md"
      >
        {dialog?.mode === 'view' && (
          <TaskDetails
            task={dialog.task}
            onEdit={() => setDialog({ mode: 'edit', task: dialog.task })}
            onDelete={() => setDeleteTarget(dialog.task)}
          />
        )}
      </Modal>

      <Modal open={dialog?.mode === 'edit'} onClose={() => setDialog(null)} title="Edit task" size="lg">
        {dialog?.mode === 'edit' && (
          <TaskForm
            defaultValues={{
              title: dialog.task.title,
              description: dialog.task.description,
              status: dialog.task.status,
              priority: dialog.task.priority,
              due_date: dialog.task.due_date ?? '',
              assigned_member_id: dialog.task.assigned_member_id ?? '',
              tags: dialog.task.tags.join(', '),
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
        title="Delete task"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete task"
        isLoading={deleteTask.isPending}
      />
    </div>
  )
}
