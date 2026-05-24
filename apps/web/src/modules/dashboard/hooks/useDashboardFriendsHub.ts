// apps/web/src/hooks/dashboard/useDashboardFriendsHub.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import type {
  ApiResponse,
  DashboardFriend,
} from '../types/dashboard.types'

export const useDashboardFriendsHub = (limit = 4) => {
  return useQuery({
    queryKey: ['dashboard', 'friends-hub', limit],
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<DashboardFriend[]>>(
          '/dashboard/friends-hub',
          {
            params: { limit },
          }
        )

      return response.data.data
    },
  })
}