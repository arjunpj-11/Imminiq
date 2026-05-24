import { create } from 'zustand'

type Theme = 'light' | 'dark'
export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeStore {
  /**
   * Permanently saved theme mode.
   * This should match the last saved preference.
   */
  mode: ThemeMode

  /**
   * Currently applied visual theme.
   * This can change temporarily during preview.
   */
  theme: Theme

  /**
   * Temporary unsaved preview mode.
   * Null means no preview is active.
   */
  previewMode: ThemeMode | null

  /**
   * True after initTheme runs once.
   */
  initialized: boolean

  /**
   * Permanently apply and save the theme locally.
   * Use this only after "Save Changes" succeeds.
   */
  setMode: (mode: ThemeMode) => void

  /**
   * Apply DB theme only when localStorage does not already have a theme.
   * Useful after login / current user settings fetch.
   */
  syncServerModeIfLocalMissing: (mode: ThemeMode) => void

  /**
   * Temporarily preview the selected theme without saving it.
   * Use this while clicking Light / Dark / System in settings.
   */
  previewThemeMode: (mode: ThemeMode) => void

  /**
   * Cancel the temporary preview and restore the last saved mode.
   * Use this when leaving the preferences page without saving.
   */
  clearThemePreview: () => void

  toggleTheme: () => void
  initTheme: () => void
}

const THEME_STORAGE_KEY = 'theme_mode'

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === 'light' || value === 'dark' || value === 'system'
}

const getSystemTheme = (): Theme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const resolveTheme = (mode: ThemeMode): Theme => {
  return mode === 'system' ? getSystemTheme() : mode
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const hasSavedLocalThemeMode = () => {
  return isThemeMode(localStorage.getItem(THEME_STORAGE_KEY))
}

const getSavedThemeMode = (): ThemeMode => {
  const savedMode = localStorage.getItem(THEME_STORAGE_KEY)

  if (isThemeMode(savedMode)) {
    return savedMode
  }

  return 'system'
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'system',
  theme: 'light',
  previewMode: null,
  initialized: false,

  setMode: (mode) => {
    const theme = resolveTheme(mode)

    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, mode)

    set({
      mode,
      theme,
      previewMode: null,
      initialized: true,
    })
  },

  syncServerModeIfLocalMissing: (mode) => {
    if (hasSavedLocalThemeMode()) {
      return
    }

    const theme = resolveTheme(mode)

    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, mode)

    set({
      mode,
      theme,
      previewMode: null,
      initialized: true,
    })
  },

  previewThemeMode: (mode) => {
    const theme = resolveTheme(mode)

    applyTheme(theme)

    set({
      theme,
      previewMode: mode,
    })
  },

  clearThemePreview: () => {
    const { mode, previewMode } = get()

    if (!previewMode) {
      return
    }

    const savedTheme = resolveTheme(mode)

    applyTheme(savedTheme)

    set({
      theme: savedTheme,
      previewMode: null,
    })
  },

  toggleTheme: () => {
    const currentTheme = get().theme
    const nextMode: ThemeMode =
      currentTheme === 'dark' ? 'light' : 'dark'

    const nextTheme = resolveTheme(nextMode)

    applyTheme(nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextMode)

    set({
      mode: nextMode,
      theme: nextTheme,
      previewMode: null,
      initialized: true,
    })
  },

  initTheme: () => {
    const alreadyInitialized = get().initialized

    if (alreadyInitialized) {
      return
    }

    const mode = getSavedThemeMode()
    const theme = resolveTheme(mode)

    applyTheme(theme)

    set({
      mode,
      theme,
      previewMode: null,
      initialized: true,
    })

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = () => {
      const { mode: currentSavedMode, previewMode } = get()

      if (previewMode === 'system') {
        const previewTheme = resolveTheme('system')

        applyTheme(previewTheme)

        set({
          theme: previewTheme,
        })

        return
      }

      if (currentSavedMode !== 'system' || previewMode) {
        return
      }

      const newSystemTheme = resolveTheme('system')

      applyTheme(newSystemTheme)

      set({
        theme: newSystemTheme,
      })
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
  },
}))