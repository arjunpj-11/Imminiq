// apps/web/src/hooks/dashboard/useDashboardFriendsHub.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../../../lib/axios'
import type {
  IApiResponse,
  IDashboardFriend,
} from '../types/dashboard.types'

export const useDashboardFriendsHub = (limit = 4) => {
  return useQuery({
    queryKey: ['dashboard', 'friends-hub', limit],
    queryFn: async () => {
      const response =
        await api.get<IApiResponse<IDashboardFriend[]>>(
          '/dashboard/friends-hub',
          {
            params: { limit },
          }
        )

      return response.data.data
    },
  })
}