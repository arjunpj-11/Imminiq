import { create } from 'zustand'
import type { UserSettings } from '../types/settings.types'

interface SettingsStore {
  settings: UserSettings | null
  setSettings: (settings: UserSettings) => void
  clearSettings: () => void
  applyAppearanceToDocument: (settings?: UserSettings | null) => void
}

const applyTheme = (theme: UserSettings['appearance']['theme']) => {
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
    return
  }

  if (theme === 'light') {
    root.classList.remove('dark')
    return
  }

  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  root.classList.toggle('dark', prefersDark)
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,

  setSettings: (settings) => {
    set({ settings })
    applyTheme(settings.appearance.theme)
  },

  clearSettings: () => set({ settings: null }),

  applyAppearanceToDocument: (settingsArg) => {
    const activeSettings = settingsArg ?? get().settings

    if (!activeSettings) {
      return
    }

    applyTheme(activeSettings.appearance.theme)
  },
}))