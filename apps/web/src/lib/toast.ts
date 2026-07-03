export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
  /** Use 0 for a persistent toast that must be dismissed or updated. */
  duration?: number
}

export interface ToastRecord extends Required<Pick<ToastInput, 'title' | 'tone' | 'duration'>> {
  id: number
  description?: string
}

type ToastEvent =
  | { type: 'upsert'; toast: ToastRecord }
  | { type: 'dismiss'; id: number }
  | { type: 'clear' }

type ToastListener = (event: ToastEvent) => void

const listeners = new Set<ToastListener>()
let nextId = 1

const emit = (event: ToastEvent) => {
  listeners.forEach((listener) => listener(event))
}

export const subscribeToToasts = (listener: ToastListener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const showToast = (input: ToastInput) => {
  const id = nextId++
  emit({
    type: 'upsert',
    toast: {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? 'info',
      duration: input.duration ?? 4200,
    },
  })
  return id
}

export const updateToast = (id: number, input: ToastInput) => {
  emit({
    type: 'upsert',
    toast: {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? 'info',
      duration: input.duration ?? 4200,
    },
  })
  return id
}

export const dismissToast = (id: number) => emit({ type: 'dismiss', id })
export const clearToasts = () => emit({ type: 'clear' })

export const toast = {
  show: showToast,
  update: updateToast,
  dismiss: dismissToast,
  clear: clearToasts,
  loading: (title: string, description?: string) =>
    showToast({ title, description, tone: 'info', duration: 0 }),
  success: (title: string, description?: string) =>
    showToast({ title, description, tone: 'success' }),
  error: (title: string, description?: string) =>
    showToast({ title, description, tone: 'error', duration: 5600 }),
  warning: (title: string, description?: string) =>
    showToast({ title, description, tone: 'warning', duration: 5000 }),
  info: (title: string, description?: string) =>
    showToast({ title, description, tone: 'info' }),
}
