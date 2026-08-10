import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setRole(userDoc.data().role)
            setUserName(userDoc.data().name)
          } else {
            setRole(null)
            setUserName(null)
          }
        } catch {
          setRole(null)
          setUserName(null)
        }
        setUser(firebaseUser)
      } else {
        setUser(null)
        setRole(null)
        setUserName(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  async function logout() {
    await signOut(auth)
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
