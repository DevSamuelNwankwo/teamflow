export function TaskTags({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null

  return (
    <div className={className ? className : 'flex flex-wrap gap-1'}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] font-medium text-text-secondary"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
