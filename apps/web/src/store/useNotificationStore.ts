import { create } from 'zustand'

interface NotificationStore {
  unreadCount: number
  setUnreadCount: (n: number) => void
  incrementUnread: () => void
  resetUnread: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}))