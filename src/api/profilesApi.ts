import { supabase } from './supabaseClient'
import { getReadableError } from './errors'
import type { Profile } from '@/types/profile'

export const profilesApi = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(getReadableError(error))
    return data
  },

  async listAll(): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('name')
    if (error) throw new Error(getReadableError(error))
    return data
  },

  async updateOwnProfile(id: string, updates: Partial<Pick<Profile, 'name' | 'role' | 'avatar_url'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(getReadableError(error))
    return data
  },
}
