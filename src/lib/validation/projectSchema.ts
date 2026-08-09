import { z } from 'zod'
import { PRIORITY_LEVELS, PROJECT_STATUSES } from '@/types/enums'

export const projectSchema = z
  .object({
    name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(120),
    description: z.string().trim().max(2000),
    status: z.enum(PROJECT_STATUSES),
    priority: z.enum(PRIORITY_LEVELS),
    start_date: z.string().min(1, 'Start date is required'),
    due_date: z.string().min(1, 'Due date is required'),
    memberIds: z.array(z.string()),
  })
  .refine((data) => data.due_date >= data.start_date, {
    message: 'Due date must be on or after the start date',
    path: ['due_date'],
  })

export type ProjectFormValues = z.infer<typeof projectSchema>
