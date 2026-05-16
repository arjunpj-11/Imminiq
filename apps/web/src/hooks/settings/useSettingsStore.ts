import { create } from 'zustand'
import type { UserSettings } from '../../types/settings.types'

interface SettingsStore {
  settings: UserSettings | null
  setSettings: (settings: UserSettings) => void
  clearSettings: () => void
  applyAppearanceToDocument: (settings?: UserSettings | null) => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,

  setSettings: (settings) => {
    set({ settings })

    const theme = settings.appearance.theme
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      root.classList.toggle('dark', prefersDark)
    }

    root.style.setProperty(
      '--imminiq-accent',
      settings.appearance.accentColor
    )
  },

  clearSettings: () => set({ settings: null }),

  applyAppearanceToDocument: (settingsArg) => {
    const activeSettings = settingsArg ?? get().settings
    if (!activeSettings) return

    const root = document.documentElement
    const theme = activeSettings.appearance.theme

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      root.classList.toggle('dark', prefersDark)
    }

    root.style.setProperty(
      '--imminiq-accent',
      activeSettings.appearance.accentColor
    )
  },
}))