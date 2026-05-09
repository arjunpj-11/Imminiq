import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  activeModal: string | null
  toggleSidebar: () => void
  openModal: (name: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
}))