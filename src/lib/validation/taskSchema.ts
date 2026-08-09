import { z } from 'zod'
import { PRIORITY_LEVELS, TASK_STATUSES } from '@/types/enums'

export const taskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(150),
  description: z.string().trim().max(2000),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(PRIORITY_LEVELS),
  due_date: z.string(),
  assigned_member_id: z.string(),
  tags: z.string(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
