import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../../lib/axios'
import type { INotificationList } from '../types/notification.types'

interface ApiResponse<T> { data: T }
export const notificationKeys = { all: ['notifications'] as const }

export const useNotifications = (enabled = true) => useQuery({
  queryKey: notificationKeys.all,
  queryFn: async () => (await api.get<ApiResponse<INotificationList>>('/notifications')).data.data,
  refetchInterval: 15_000,
  enabled,
})

export const useMarkNotificationRead = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export const useMarkAllNotificationsRead = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
