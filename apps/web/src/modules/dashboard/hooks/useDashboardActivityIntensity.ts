// apps/web/src/hooks/dashboard/useDashboardActivityIntensity.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import type {
  ApiResponse,
  DashboardActivityIntensityItem,
} from '../types/dashboard.types'

export const useDashboardActivityIntensity = (
  months: 6 | 12
) => {
  return useQuery({
    queryKey: ['dashboard', 'activity-intensity', months],
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<DashboardActivityIntensityItem[]>>(
          '/dashboard/activity-intensity',
          {
            params: { months },
          }
        )

      return response.data.data
    },
  })
}