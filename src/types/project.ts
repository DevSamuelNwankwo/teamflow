import type { Database } from './database.types'
import type { Profile } from './profile'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

/** Project row with its assigned members joined in — what list/detail views actually render. */
export interface ProjectWithMembers extends Project {
  members: Profile[]
}
