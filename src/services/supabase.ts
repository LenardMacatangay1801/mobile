import './installLocalStorage'
import { AppState } from 'react-native'
import { createClient, type SupportedStorage } from '@supabase/supabase-js'

function createMemoryStorage(): SupportedStorage {
  const store = new Map<string, string>()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value)
    },
    removeItem: (key) => {
      store.delete(key)
    },
  }
}

const authStorage: SupportedStorage =
  typeof localStorage !== 'undefined' ? localStorage : createMemoryStorage()

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl ?? '', supabasePublishableKey ?? '', {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export type UserProfile = {
  role: string | null
  name: string | null
}

export function isMeterReader(role: string | null | undefined) {
  return role === 'reader' || role === 'meter-reader'
}

function pickProfile(row: Record<string, unknown> | null): UserProfile {
  if (!row) return { role: null, name: null }
  const name = row.name ?? row.full_name ?? row.display_name
  const role = row.role
  return {
    role: typeof role === 'string' ? role : null,
    name: typeof name === 'string' ? name : null,
  }
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .eq('id', userId)
    .maybeSingle()

  return {
    profile: pickProfile((data as Record<string, unknown> | null) ?? null),
    error,
    hasRow: Boolean(data),
  }
}
