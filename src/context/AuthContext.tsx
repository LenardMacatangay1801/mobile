import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { fetchUserProfile, supabase } from '@/services/supabase'
import type { AuthBusyKind } from '@/components/auth-loading-overlay'

interface AuthContextType {
  user: User | null
  role: string | null
  userName: string | null
  loading: boolean
  busy: AuthBusyKind | null
  beginSignIn: () => void
  endSignIn: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [role, setRole]         = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState<AuthBusyKind | null>('restoring')

  useEffect(() => {
    let cancelled = false

    async function applySession(session: Session | null) {
      if (!session?.user) {
        if (!cancelled) {
          setUser(null)
          setRole(null)
          setUserName(null)
          setLoading(false)
          setBusy((current) => (current === 'restoring' ? null : current))
        }
        return
      }

      const { profile } = await fetchUserProfile(session.user.id)
      if (cancelled) return

      setUser(session.user)
      setRole(profile.role)
      setUserName(profile.name)
      setLoading(false)
      setBusy((current) => (current === 'restoring' ? null : current))
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't fight an in-progress sign-out or sign-in overlay.
      applySession(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  function beginSignIn() {
    setBusy('signingIn')
  }

  function endSignIn() {
    setBusy(null)
  }

  async function logout() {
    setBusy('signingOut')
    try {
      await wait(1100)
      await supabase.auth.signOut()
    } finally {
      setUser(null)
      setRole(null)
      setUserName(null)
    }

    const { router } = await import('expo-router')
    router.replace('/(auth)/login')
    await wait(620)
    setBusy(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userName,
        loading,
        busy,
        beginSignIn,
        endSignIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth() must be used inside <AuthProvider>')
  return context
}
