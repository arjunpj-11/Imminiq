// apps/web/src/hooks/dashboard/useDashboardRecommendedActions.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import type {
  IApiResponse,
  IDashboardRecommendedAction,
} from '../types/dashboard.types'

export const useDashboardRecommendedActions = () => {
  return useQuery({
    queryKey: ['dashboard', 'recommended-actions'],
    queryFn: async () => {
      const response =
        await api.get<IApiResponse<IDashboardRecommendedAction[]>>(
          '/dashboard/recommended-actions'
        )

      return response.data.data
    },
  })
}