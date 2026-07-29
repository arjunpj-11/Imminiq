import { afterEach, describe, expect, it, vi } from 'vitest';

const installThemeDom = (savedMode: string | null, initialSystemDark: boolean) => {
  let systemDark = initialSystemDark;
  const classNames = new Set<string>();
  const mediaListeners = new Set<() => void>();
  const pageShowListeners = new Set<() => void>();
  const storage = new Map<string, string>();

  if (savedMode) storage.set('theme_mode', savedMode);

  const mediaQuery = {
    get matches() {
      return systemDark;
    },
    addEventListener: (_type: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => mediaListeners.delete(listener),
  };

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    matchMedia: () => mediaQuery,
    addEventListener: (type: string, listener: () => void) => {
      if (type === 'pageshow') pageShowListeners.add(listener);
    },
    removeEventListener: (type: string, listener: () => void) => {
      if (type === 'pageshow') pageShowListeners.delete(listener);
    },
  });
  vi.stubGlobal('document', {
    documentElement: {
      classList: {
        add: (name: string) => classNames.add(name),
        remove: (name: string) => classNames.delete(name),
        contains: (name: string) => classNames.has(name),
        toggle: (name: string, force: boolean) =>
          force ? classNames.add(name) : classNames.delete(name),
      },
    },
  });

  return {
    classNames,
    setSystemDark(value: boolean) {
      systemDark = value;
      mediaListeners.forEach((listener) => listener());
    },
    restorePage() {
      pageShowListeners.forEach((listener) => listener());
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('theme store', () => {
  it('re-resolves system mode when the app remounts with a stale dark class', async () => {
    const environment = installThemeDom('system', false);
    const { useThemeStore } = await import('../../src/store/useThemeStore');

    const cleanupFirstMount = useThemeStore.getState().initTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    cleanupFirstMount();

    environment.classNames.add('dark');
    useThemeStore.setState({ theme: 'dark' });

    const cleanupSecondMount = useThemeStore.getState().initTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(environment.classNames.has('dark')).toBe(false);
    cleanupSecondMount();
  });

  it('follows system changes and page restores only while system mode is active', async () => {
    const environment = installThemeDom('system', false);
    const { useThemeStore } = await import('../../src/store/useThemeStore');

    const cleanup = useThemeStore.getState().initTheme();
    environment.setSystemDark(true);
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(environment.classNames.has('dark')).toBe(true);

    environment.setSystemDark(false);
    environment.restorePage();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(environment.classNames.has('dark')).toBe(false);

    cleanup();
    environment.setSystemDark(true);
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('does not let system changes override an explicit saved theme', async () => {
    const environment = installThemeDom('dark', false);
    const { useThemeStore } = await import('../../src/store/useThemeStore');

    const cleanup = useThemeStore.getState().initTheme();
    environment.setSystemDark(true);
    environment.setSystemDark(false);

    expect(useThemeStore.getState().mode).toBe('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(environment.classNames.has('dark')).toBe(true);
    cleanup();
  });
});
