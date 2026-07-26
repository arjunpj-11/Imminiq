import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../lib/storage/storage-keys';
import { safeLocalStateStorage, safeLocalStorage } from '../lib/storage/safe-storage';

interface IAppShellStore {
  mobileSidebarOpen: boolean;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  routeRefreshVersion: number;
  contentDensity: 'comfortable' | 'compact';
  reduceMotion: boolean;
  messageNotificationMode: 'all' | 'mentions' | 'muted';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  mutedConversationIds: string[];
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  refreshCurrentRoute: () => void;
  setContentDensity: (density: 'comfortable' | 'compact') => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  setMessageNotificationMode: (mode: 'all' | 'mentions' | 'muted') => void;
  setQuietHours: (input: { enabled: boolean; start: string; end: string }) => void;
  toggleMutedConversation: (conversationId: string) => void;
}

const legacySidebarCollapsed = safeLocalStorage.get(STORAGE_KEYS.legacySidebar) === 'closed';

export const useAppShellStore = create<IAppShellStore>()(
  persist(
    (set) => ({
      mobileSidebarOpen: false,
      sidebarCollapsed: legacySidebarCollapsed,
      commandPaletteOpen: false,
      routeRefreshVersion: 0,
      contentDensity: 'comfortable',
      reduceMotion: false,
      messageNotificationMode: 'all',
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      mutedConversationIds: [],
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      toggleSidebarCollapsed: () =>
        set((state) => {
          const next = !state.sidebarCollapsed;
          safeLocalStorage.set(STORAGE_KEYS.legacySidebar, next ? 'closed' : 'open');
          return { sidebarCollapsed: next };
        }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      refreshCurrentRoute: () =>
        set((state) => ({ routeRefreshVersion: state.routeRefreshVersion + 1 })),
      setContentDensity: (contentDensity) => set({ contentDensity }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setMessageNotificationMode: (messageNotificationMode) => set({ messageNotificationMode }),
      setQuietHours: ({ enabled, start, end }) =>
        set({
          quietHoursEnabled: enabled,
          quietHoursStart: start,
          quietHoursEnd: end,
        }),
      toggleMutedConversation: (conversationId) =>
        set((state) => ({
          mutedConversationIds: state.mutedConversationIds.includes(conversationId)
            ? state.mutedConversationIds.filter((id) => id !== conversationId)
            : [...state.mutedConversationIds, conversationId],
        })),
      setSidebarCollapsed: (sidebarCollapsed) => {
        safeLocalStorage.set(STORAGE_KEYS.legacySidebar, sidebarCollapsed ? 'closed' : 'open');
        set({ sidebarCollapsed });
      },
    }),
    {
      name: STORAGE_KEYS.appShell,
      storage: createJSONStorage(() => safeLocalStateStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        contentDensity: state.contentDensity,
        reduceMotion: state.reduceMotion,
        messageNotificationMode: state.messageNotificationMode,
        quietHoursEnabled: state.quietHoursEnabled,
        quietHoursStart: state.quietHoursStart,
        quietHoursEnd: state.quietHoursEnd,
        mutedConversationIds: state.mutedConversationIds,
      }),
    }
  )
);
