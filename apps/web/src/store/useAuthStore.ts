import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  username: string
  email: string
  role: string
  isPremium: boolean
  avatar?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth' }
  )
)