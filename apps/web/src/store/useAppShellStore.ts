import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '../lib/storage/storage-keys'
import { safeLocalStateStorage, safeLocalStorage } from '../lib/storage/safe-storage'

interface IAppShellStore {
  mobileSidebarOpen: boolean
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
}

const legacySidebarCollapsed =
  safeLocalStorage.get(STORAGE_KEYS.legacySidebar) === 'closed'

export const useAppShellStore = create<IAppShellStore>()(
  persist(
    (set) => ({
      mobileSidebarOpen: false,
      sidebarCollapsed: legacySidebarCollapsed,
      commandPaletteOpen: false,
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
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
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
