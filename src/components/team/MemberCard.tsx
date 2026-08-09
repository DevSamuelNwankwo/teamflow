import { FolderKanban, ListChecks } from 'lucide-react'
import type { Profile } from '@/types/profile'
import { Avatar } from '@/components/ui/Avatar'
import { MEMBER_STATUS_STYLES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MemberWorkload } from '@/hooks/useMemberWorkload'

interface MemberCardProps {
  member: Profile
  workload?: MemberWorkload
}

function formatProjectList(names: string[]): string {
  if (names.length === 0) return 'No projects assigned'
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`
}

export function MemberCard({ member, workload }: MemberCardProps) {
  const statusStyle = MEMBER_STATUS_STYLES[member.status]
  const projectNames = workload?.projectNames ?? []
  const taskCount = workload?.taskCount ?? 0

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border-default bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Avatar name={member.name} src={member.avatar_url} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{member.name}</p>
          <p className="truncate text-xs text-text-secondary">{member.role}</p>
          <p className="truncate text-xs text-text-tertiary">{member.email}</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyle.bg, statusStyle.text)}>
          {statusStyle.label}
        </span>
      </div>

      <div className="flex items-center gap-4 border-t border-border-subtle pt-3 text-xs text-text-secondary">
        <span className="flex min-w-0 items-center gap-1.5" title={formatProjectList(projectNames)}>
          <FolderKanban size={14} className="shrink-0 text-text-tertiary" />
          <span className="truncate">
            {projectNames.length} project{projectNames.length === 1 ? '' : 's'}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <ListChecks size={14} className="shrink-0 text-text-tertiary" />
          {taskCount} task{taskCount === 1 ? '' : 's'} assigned
        </span>
      </div>
    </div>
  )
}
