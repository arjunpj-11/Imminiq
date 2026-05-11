import { create } from 'zustand'

type Theme = 'light' | 'dark'
type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeStore {
  mode: ThemeMode
  theme: Theme
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  initTheme: () => void
}

const getSystemTheme = (): Theme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'system',
  theme: 'light',

  setMode: (mode) => {
    const theme = mode === 'system' ? getSystemTheme() : mode

    applyTheme(theme)
    localStorage.setItem('theme_mode', mode)

    set({
      mode,
      theme,
    })
  },

  toggleTheme: () => {
    const currentTheme = get().theme
    const nextTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark'

    applyTheme(nextTheme)
    localStorage.setItem('theme_mode', nextTheme)

    set({
      mode: nextTheme,
      theme: nextTheme,
    })
  },

  initTheme: () => {
    const savedMode = localStorage.getItem('theme_mode') as ThemeMode | null

    const mode: ThemeMode =
      savedMode === 'light' || savedMode === 'dark' || savedMode === 'system'
        ? savedMode
        : 'system'

    const theme = mode === 'system' ? getSystemTheme() : mode

    applyTheme(theme)

    set({
      mode,
      theme,
    })

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = () => {
      const currentMode = get().mode

      if (currentMode !== 'system') return

      const newSystemTheme = getSystemTheme()

      applyTheme(newSystemTheme)

      set({
        theme: newSystemTheme,
      })
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
  },
}))