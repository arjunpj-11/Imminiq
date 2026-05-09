import { create } from 'zustand'

interface ChatStore {
  activeThreadId: string | null
  typingUsers: Record<string, boolean>
  setActiveThread: (id: string) => void
  setTyping: (userId: string, isTyping: boolean) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  activeThreadId: null,
  typingUsers: {},
  setActiveThread: (id) => set({ activeThreadId: id }),
  setTyping: (userId, isTyping) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [userId]: isTyping } })),
}))