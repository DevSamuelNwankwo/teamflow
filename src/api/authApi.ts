import { supabase } from './supabaseClient'
import { getReadableError } from './errors'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export const authApi = {
  async register({ name, email, password }: RegisterInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(getReadableError(error))
    return data
  },

  async login({ email, password }: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(getReadableError(error))
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(getReadableError(error))
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new Error(getReadableError(error))
    return data.session
  },
}
