import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/api/supabaseClient'
import { profilesApi } from '@/api/profilesApi'
import { authApi, type LoginInput, type RegisterInput } from '@/api/authApi'
import type { Profile } from '@/types/profile'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  profile: Profile | null
  login: (input: LoginInput) => Promise<void>
  /** Returns false when Supabase requires email confirmation before a session exists yet
   *  (project-level setting) — callers should show a "check your email" message rather than
   *  navigating into the app. Returns true when registration logs the user straight in. */
  register: (input: RegisterInput) => Promise<boolean>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Wraps the Supabase auth session. Hydrates from the session Supabase already persists in
 *  localStorage on mount, then stays in sync via onAuthStateChange (covers token refresh and
 *  cross-tab login/logout). `status` starts at 'loading' so ProtectedRoute never flashes the
 *  login page before the real session is known. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  async function hydrateProfile(session: Session | null) {
    if (!session?.user) {
      setUser(null)
      setProfile(null)
      setStatus('unauthenticated')
      return
    }
    setUser(session.user)
    try {
      const p = await profilesApi.getById(session.user.id)
      setProfile(p)
    } catch {
      // Profile fetch failing shouldn't block the app from recognizing an authenticated session —
      // pages that need profile fields handle `profile === null` via their own loading/error state.
      setProfile(null)
    }
    setStatus('authenticated')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => hydrateProfile(data.session))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateProfile(session)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const value: AuthContextValue = {
    status,
    user,
    profile,
    login: async (input) => {
      await authApi.login(input)
    },
    register: async (input) => {
      const data = await authApi.register(input)
      return Boolean(data.session)
    },
    logout: async () => {
      await authApi.logout()
    },
    refreshProfile: async () => {
      if (user) setProfile(await profilesApi.getById(user.id))
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
