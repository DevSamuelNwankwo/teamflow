import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/validation/taskSchema'
import { TASK_STATUSES, PRIORITY_LEVELS } from '@/types/enums'
import { TASK_STATUS_STYLES, PRIORITY_STYLES } from '@/lib/constants'
import { FormField } from '@/components/ui/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TaskAssigneeSelect } from './TaskAssigneeSelect'

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function TaskForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save task' }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: '',
      assigned_member_id: '',
      tags: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Task title" error={errors.title?.message} required>
        <Input placeholder="e.g. Set up CI pipeline" {...register('title')} />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea placeholder="What needs to be done?" {...register('description')} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Status" error={errors.status?.message} required>
          <Select {...register('status')}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_STYLES[status].label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Priority" error={errors.priority?.message} required>
          <Select {...register('priority')}>
            {PRIORITY_LEVELS.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_STYLES[priority].label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Due date" error={errors.due_date?.message}>
          <Input type="date" {...register('due_date')} />
        </FormField>

        <FormField label="Assignee" error={errors.assigned_member_id?.message}>
          <TaskAssigneeSelect {...register('assigned_member_id')} />
        </FormField>
      </div>

      <FormField label="Tags" error={errors.tags?.message} hint="Comma-separated, e.g. frontend, urgent">
        <Input placeholder="frontend, urgent" {...register('tags')} />
      </FormField>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
