import { useQuery } from '@tanstack/react-query'
import { profilesApi } from '@/api/profilesApi'

export function useTeamMembers() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: profilesApi.listAll,
    staleTime: 60_000,
  })
}
