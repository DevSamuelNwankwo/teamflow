import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2)
  return (initials || '?').toUpperCase()
}

/** Consistent avatar used across TaskCard, ProjectCard, TeamPage, and the assignee picker. */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300',
        sizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}

interface AvatarGroupProps {
  members: { id: string; name: string; avatar_url?: string | null }[]
  max?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ members, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = members.slice(0, max)
  const overflow = members.length - visible.length

  if (members.length === 0) {
    return <span className="text-sm text-text-tertiary">Unassigned</span>
  }

  return (
    <div className="flex -space-x-2">
      {visible.map((m) => (
        <Avatar
          key={m.id}
          name={m.name}
          src={m.avatar_url}
          size={size}
          className="ring-2 ring-surface"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-medium text-text-secondary ring-2 ring-surface',
            sizeClasses[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
