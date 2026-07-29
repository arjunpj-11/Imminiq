import { safeLocalStorage } from '../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../lib/storage/storage-keys';
import { create } from 'zustand';

type Theme = 'light' | 'dark';
export type ThemeMode = 'system' | 'light' | 'dark';

interface IThemeStore {
  /**
   * Permanently saved theme mode.
   * This should match the last saved preference.
   */
  mode: ThemeMode;

  /**
   * Currently applied visual theme.
   * This can change temporarily during preview.
   */
  theme: Theme;

  /**
   * Temporary unsaved preview mode.
   * Null means no preview is active.
   */
  previewMode: ThemeMode | null;

  /**
   * Permanently apply and save the theme locally.
   * Use this only after "Save Changes" succeeds.
   */
  setMode: (mode: ThemeMode) => void;

  /**
   * Apply DB theme only when localStorage does not already have a theme.
   * Useful after login / current user settings fetch.
   */
  syncServerModeIfLocalMissing: (mode: ThemeMode) => void;

  /**
   * Temporarily preview the selected theme without saving it.
   * Use this while clicking Light / Dark / System in settings.
   */
  previewThemeMode: (mode: ThemeMode) => void;

  /**
   * Cancel the temporary preview and restore the last saved mode.
   * Use this when leaving the preferences page without saving.
   */
  clearThemePreview: () => void;

  toggleTheme: () => void;
  initTheme: () => () => void;
}

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === 'light' || value === 'dark' || value === 'system';
};

const themeFromSystemPreference = (prefersDark: boolean): Theme => (prefersDark ? 'dark' : 'light');

const resolveTheme = (mode: ThemeMode): Theme => {
  return mode === 'system'
    ? themeFromSystemPreference(window.matchMedia(SYSTEM_DARK_QUERY).matches)
    : mode;
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const hasSavedLocalThemeMode = () => {
  return isThemeMode(safeLocalStorage.get(STORAGE_KEYS.themeMode));
};

const getSavedThemeMode = (): ThemeMode => {
  const savedMode = safeLocalStorage.get(STORAGE_KEYS.themeMode);

  if (isThemeMode(savedMode)) {
    return savedMode;
  }

  return 'system';
};

export const useThemeStore = create<IThemeStore>((set, get) => ({
  mode: 'system',
  theme: 'light',
  previewMode: null,

  setMode: (mode) => {
    const theme = resolveTheme(mode);

    applyTheme(theme);
    safeLocalStorage.set(STORAGE_KEYS.themeMode, mode);

    set({
      mode,
      theme,
      previewMode: null,
    });
  },

  syncServerModeIfLocalMissing: (mode) => {
    if (hasSavedLocalThemeMode()) {
      return;
    }

    const theme = resolveTheme(mode);

    applyTheme(theme);
    safeLocalStorage.set(STORAGE_KEYS.themeMode, mode);

    set({
      mode,
      theme,
      previewMode: null,
    });
  },

  previewThemeMode: (mode) => {
    const theme = resolveTheme(mode);

    applyTheme(theme);

    set({
      theme,
      previewMode: mode,
    });
  },

  clearThemePreview: () => {
    const { mode, previewMode } = get();

    if (!previewMode) {
      return;
    }

    const savedTheme = resolveTheme(mode);

    applyTheme(savedTheme);

    set({
      theme: savedTheme,
      previewMode: null,
    });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextMode: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';

    const nextTheme = resolveTheme(nextMode);

    applyTheme(nextTheme);
    safeLocalStorage.set(STORAGE_KEYS.themeMode, nextMode);

    set({
      mode: nextMode,
      theme: nextTheme,
      previewMode: null,
    });
  },

  initTheme: () => {
    const mode = getSavedThemeMode();
    const theme = resolveTheme(mode);

    applyTheme(theme);

    set({
      mode,
      theme,
      previewMode: null,
    });

    const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);

    const syncActiveTheme = () => {
      const { mode: savedMode, previewMode } = get();
      const activeMode = previewMode ?? savedMode;
      const activeTheme =
        activeMode === 'system' ? themeFromSystemPreference(mediaQuery.matches) : activeMode;

      applyTheme(activeTheme);
      set({ theme: activeTheme });
    };

    mediaQuery.addEventListener('change', syncActiveTheme);
    window.addEventListener('pageshow', syncActiveTheme);

    return () => {
      mediaQuery.removeEventListener('change', syncActiveTheme);
      window.removeEventListener('pageshow', syncActiveTheme);
    };
  },
}));
