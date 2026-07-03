import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

const shouldRetry = (failureCount: number, error: unknown) => {
  if (failureCount >= 2) return false

  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false
    }
  }

  return true
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(750 * 2 ** attempt, 5000),
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
})
