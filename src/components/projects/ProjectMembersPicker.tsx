import { useTeamMembers } from '@/hooks/useTeamMembers'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface ProjectMembersPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

/** Multi-select of the shared workspace's team members, used by ProjectForm and (in Part 2)
 *  TaskAssigneeSelect for single-select assignment. */
export function ProjectMembersPicker({ selectedIds, onChange }: ProjectMembersPickerProps) {
  const { data: members, isLoading } = useTeamMembers()

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((m) => m !== id) : [...selectedIds, id])
  }

  if (isLoading) {
    return <p className="text-sm text-text-tertiary">Loading team members…</p>
  }

  if (!members || members.length === 0) {
    return <p className="text-sm text-text-tertiary">No team members yet.</p>
  }

  return (
    <div
      role="group"
      aria-label="Assign team members"
      className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-control border border-border-default p-2"
    >
      {members.map((member) => {
        const checked = selectedIds.includes(member.id)
        return (
          <label
            key={member.id}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-control px-2 py-1.5 text-sm hover:bg-surface-sunken',
              checked && 'bg-brand-50 dark:bg-brand-600/10',
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(member.id)}
              className="h-4 w-4 rounded border-border-default text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            />
            <Avatar name={member.name} src={member.avatar_url} size="xs" />
            <span className="text-text-primary">{member.name}</span>
          </label>
        )
      })}
    </div>
  )
}
