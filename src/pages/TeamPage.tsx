import { Users } from 'lucide-react'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { MemberCard } from '@/components/team/MemberCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CardSkeletonGrid } from '@/components/ui/Skeleton'

export function TeamPage() {
  const { data: members, isLoading, isError, refetch } = useTeamMembers()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Team</h2>
        <p className="text-sm text-text-secondary">
          Everyone who has registered is automatically part of the shared workspace.
        </p>
      </div>

      {isLoading && <CardSkeletonGrid count={3} />}
      {isError && <ErrorState message="Couldn't load team members." onRetry={() => refetch()} />}

      {!isLoading && !isError && members && members.length === 0 && (
        <EmptyState icon={Users} title="No team members yet" description="Invite teammates by having them register an account." />
      )}

      {!isLoading && !isError && members && members.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  )
}
