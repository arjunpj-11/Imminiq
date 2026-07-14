import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../lib/storage/storage-keys';
import { safeLocalStateStorage } from '../lib/storage/safe-storage';

export interface IAuthUser {
  _id: string;
  fullName?: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  status?: 'active' | 'paused' | 'blocked' | 'deactivated' | 'banned';
  isPremium?: boolean;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  onboardingCompleted?: boolean;
}

interface IAuthStore {
  user: IAuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authReady: boolean;
  setUser: (user: IAuthUser) => void;
  setAccessToken: (accessToken: string | null) => void;
  setAuthReady: (authReady: boolean) => void;
  clearUser: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authReady: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setAuthReady: (authReady) => set({ authReady }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => safeLocalStateStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
