export const canUseDOM = () => typeof window !== 'undefined'

export const safeLocalStorage = {
  get(key: string): string | null {
    if (!canUseDOM()) return null

    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string): void {
    if (!canUseDOM()) return

    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Storage may be unavailable in private browsing or restricted contexts.
    }
  },
  remove(key: string): void {
    if (!canUseDOM()) return

    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore storage failures; state remains available in memory.
    }
  },
}

export const safeSessionStorage = {
  get(key: string): string | null {
    if (!canUseDOM()) return null

    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string): void {
    if (!canUseDOM()) return

    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      // Ignore storage failures; state remains available in memory.
    }
  },
  remove(key: string): void {
    if (!canUseDOM()) return

    try {
      window.sessionStorage.removeItem(key)
    } catch {
      // Ignore storage failures; state remains available in memory.
    }
  },
}

export const safeLocalStateStorage = {
  getItem: (key: string) => safeLocalStorage.get(key),
  setItem: (key: string, value: string) => safeLocalStorage.set(key, value),
  removeItem: (key: string) => safeLocalStorage.remove(key),
}

export const safeSessionStateStorage = {
  getItem: (key: string) => safeSessionStorage.get(key),
  setItem: (key: string, value: string) => safeSessionStorage.set(key, value),
  removeItem: (key: string) => safeSessionStorage.remove(key),
}
