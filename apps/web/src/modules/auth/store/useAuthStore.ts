import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  _id: string
  fullName?: string
  username: string
  email?: string
  phone?: string
  role: string
  status?: 'active' | 'paused' | 'blocked' | 'deactivated' | 'banned'
  isPremium?: boolean
  avatarUrl?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  onboardingCompleted?: boolean
}

interface AuthStore {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  authReady: boolean

  setUser: (user: AuthUser) => void
  setAccessToken: (accessToken: string | null) => void
  setAuthReady: (authReady: boolean) => void
  clearUser: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authReady: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken) =>
        set({
          accessToken,
        }),

      setAuthReady: (authReady) =>
        set({
          authReady,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth',

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)