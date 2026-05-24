// apps/web/src/hooks/dashboard/useDashboardRecommendedActions.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import type {
  ApiResponse,
  DashboardRecommendedAction,
} from '../types/dashboard.types'

export const useDashboardRecommendedActions = () => {
  return useQuery({
    queryKey: ['dashboard', 'recommended-actions'],
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<DashboardRecommendedAction[]>>(
          '/dashboard/recommended-actions'
        )

      return response.data.data
    },
  })
}