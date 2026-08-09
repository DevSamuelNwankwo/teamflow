import { Link } from 'react-router-dom'
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { ProjectWithMembers } from '@/types/project'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { AvatarGroup } from '@/components/ui/Avatar'
import { formatDueLabel } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: ProjectWithMembers
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const due = formatDueLabel(project.due_date)

  useEffect(() => {
    if (!menuOpen) return
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div className="group relative flex flex-col rounded-card border border-border-default bg-surface p-4 shadow-card transition-shadow hover:shadow-popover">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link
          to={`/app/projects/${project.id}`}
          className="text-sm font-semibold text-text-primary hover:text-brand-600 hover:underline"
        >
          {project.name}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label={`Actions for ${project.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-control text-text-tertiary hover:bg-surface-sunken hover:text-text-primary"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 w-36 rounded-control border border-border-default bg-surface py-1 shadow-popover"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onEdit()
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-status-red-text hover:bg-status-red-bg"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm text-text-secondary">
        {project.description || 'No description provided.'}
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-3">
        <div className={cn('flex items-center gap-1.5 text-xs', due.overdue ? 'text-status-red-text' : 'text-text-tertiary')}>
          <Calendar size={14} />
          {due.label}
        </div>
        <AvatarGroup members={project.members} max={3} size="xs" />
      </div>
    </div>
  )
}
