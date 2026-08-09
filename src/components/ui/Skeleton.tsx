import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  // border-default (not surface-sunken) so the pulse stays visible whether it sits directly on
  // the page background or inside a bg-surface card.
  return <div className={cn('animate-pulse rounded-control bg-border-default', className)} />
}

/** Grid of card-shaped skeletons for list/board loading states. */
export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-card border border-border-default bg-surface p-4 shadow-card">
          <Skeleton className="mb-3 h-5 w-2/3" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="mb-4 h-3 w-4/5" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}
