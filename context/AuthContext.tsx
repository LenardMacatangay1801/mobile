import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { fetchUserProfile, supabase } from '@/services/supabase'

interface AuthContextType {
  user: User | null
  role: string | null
  userName: string | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [role, setRole]         = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false

    async function applySession(session: Session | null) {
      if (!session?.user) {
        if (!cancelled) {
          setUser(null)
          setRole(null)
          setUserName(null)
          setLoading(false)
        }
        return
      }

      const { profile } = await fetchUserProfile(session.user.id)
      if (cancelled) return

      setUser(session.user)
      setRole(profile.role)
      setUserName(profile.name)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    setUserName(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, userName, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth() must be used inside <AuthProvider>')
  return context
}
