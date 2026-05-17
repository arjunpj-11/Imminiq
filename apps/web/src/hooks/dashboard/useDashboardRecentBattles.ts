// apps/web/src/hooks/dashboard/useDashboardRecentBattles.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import type {
  ApiResponse,
  DashboardRecentBattle,
} from '../../types/dashboard.types'

export const useDashboardRecentBattles = (limit = 3) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-battles', limit],
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<DashboardRecentBattle[]>>(
          '/dashboard/recent-battles',
          {
            params: { limit },
          }
        )

      return response.data.data
    },
  })
}