import { useTeamMembers } from '@/hooks/useTeamMembers'
import { Select } from '@/components/ui/Input'
import type { SelectHTMLAttributes } from 'react'

/** Single-select assignee dropdown — the task-side counterpart to ProjectMembersPicker's
 *  multi-select. An empty value means "unassigned". */
export function TaskAssigneeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { data: members, isLoading } = useTeamMembers()

  return (
    <Select disabled={isLoading} {...props}>
      <option value="">Unassigned</option>
      {members?.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </Select>
  )
}
