import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormValues } from '@/lib/validation/projectSchema'
import { PROJECT_STATUSES, PRIORITY_LEVELS } from '@/types/enums'
import { PROJECT_STATUS_STYLES, PRIORITY_STYLES } from '@/lib/constants'
import { FormField } from '@/components/ui/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProjectMembersPicker } from './ProjectMembersPicker'

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function ProjectForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save project' }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'PLANNING',
      priority: 'MEDIUM',
      start_date: '',
      due_date: '',
      memberIds: [],
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Project name" error={errors.name?.message} required>
        <Input placeholder="e.g. Mobile app redesign" {...register('name')} />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea placeholder="What is this project about?" {...register('description')} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status" error={errors.status?.message} required>
          <Select {...register('status')}>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_STYLES[status].label}
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

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start date" error={errors.start_date?.message} required>
          <Input type="date" {...register('start_date')} />
        </FormField>

        <FormField label="Due date" error={errors.due_date?.message} required>
          <Input type="date" {...register('due_date')} />
        </FormField>
      </div>

      <FormField label="Team members" error={errors.memberIds?.message as string | undefined}>
        <Controller
          control={control}
          name="memberIds"
          render={({ field }) => (
            <ProjectMembersPicker selectedIds={field.value} onChange={field.onChange} />
          )}
        />
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
