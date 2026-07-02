import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '../lib/storage/storage-keys'
import { safeLocalStateStorage, safeLocalStorage } from '../lib/storage/safe-storage'

interface AppShellStore {
  mobileSidebarOpen: boolean
  sidebarCollapsed: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

const legacySidebarCollapsed =
  safeLocalStorage.get(STORAGE_KEYS.legacySidebar) === 'closed'

export const useAppShellStore = create<AppShellStore>()(
  persist(
    (set) => ({
      mobileSidebarOpen: false,
      sidebarCollapsed: legacySidebarCollapsed,
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      toggleSidebarCollapsed: () =>
        set((state) => {
          const next = !state.sidebarCollapsed
          safeLocalStorage.set(
            STORAGE_KEYS.legacySidebar,
            next ? 'closed' : 'open',
          )
          return { sidebarCollapsed: next }
        }),
      setSidebarCollapsed: (sidebarCollapsed) => {
        safeLocalStorage.set(
          STORAGE_KEYS.legacySidebar,
          sidebarCollapsed ? 'closed' : 'open',
        )
        set({ sidebarCollapsed })
      },
    }),
    {
      name: STORAGE_KEYS.appShell,
      storage: createJSONStorage(() => safeLocalStateStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)
