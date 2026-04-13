import { create } from 'zustand'
import type { UserProfile, UserMLProfile } from '@/types'
import type { User } from '@supabase/supabase-js'

interface UserState {
  user: User | null
  profile: UserProfile | null
  mlProfile: UserMLProfile | null
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setMLProfile: (mlProfile: UserMLProfile | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  mlProfile: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setMLProfile: (mlProfile) => set({ mlProfile }),
  clearUser: () => set({ user: null, profile: null, mlProfile: null }),
}))
