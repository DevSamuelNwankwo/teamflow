// Hand-written to match supabase/migrations/0001_init.sql, in the exact shape @supabase/supabase-js
// expects (Tables/Views/Functions/Enums/CompositeTypes at the schema level, Row/Insert/Update/
// Relationships per table) so the typed client resolves real types instead of `never`.
// Once the Supabase project is live, regenerate with:
//   supabase gen types typescript --project-id <ref> > src/types/database.types.ts

import type { MemberStatus, PriorityLevel, ProjectStatus, TaskStatus } from './enums'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          role: string
          status: MemberStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          role?: string
          status?: MemberStatus
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          status: ProjectStatus
          priority: PriorityLevel
          start_date: string
          due_date: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          status?: ProjectStatus
          priority?: PriorityLevel
          start_date: string
          due_date: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
        Relationships: []
      }
      project_members: {
        Row: {
          project_id: string
          member_id: string
          added_at: string
        }
        Insert: {
          project_id: string
          member_id: string
          added_at?: string
        }
        Update: Partial<Database['public']['Tables']['project_members']['Insert']>
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          status: TaskStatus
          priority: PriorityLevel
          assigned_member_id: string | null
          due_date: string | null
          tags: string[]
          position: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string
          status?: TaskStatus
          priority?: PriorityLevel
          assigned_member_id?: string | null
          due_date?: string | null
          tags?: string[]
          position?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
        Relationships: []
      }
      activity: {
        Row: {
          id: string
          type: string
          actor_id: string | null
          project_id: string | null
          task_id: string | null
          message: string
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          actor_id?: string | null
          project_id?: string | null
          task_id?: string | null
          message: string
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['activity']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      project_status: ProjectStatus
      task_status: TaskStatus
      priority_level: PriorityLevel
      member_status: MemberStatus
    }
    CompositeTypes: Record<string, never>
  }
}
