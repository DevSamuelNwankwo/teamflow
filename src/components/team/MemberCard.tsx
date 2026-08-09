import type { Profile } from '@/types/profile'
import { Avatar } from '@/components/ui/Avatar'
import { MEMBER_STATUS_STYLES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function MemberCard({ member }: { member: Profile }) {
  const statusStyle = MEMBER_STATUS_STYLES[member.status]

  return (
    <div className="flex items-center gap-3 rounded-card border border-border-default bg-surface p-4 shadow-card">
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
  )
}
