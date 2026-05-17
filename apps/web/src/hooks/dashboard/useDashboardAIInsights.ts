// apps/web/src/hooks/dashboard/useDashboardAIInsights.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import type {
  ApiResponse,
  DashboardAIInsight,
} from '../../types/dashboard.types'

export const useDashboardAIInsights = () => {
  return useQuery({
    queryKey: ['dashboard', 'ai-insights'],
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<DashboardAIInsight>>(
          '/dashboard/ai-insights'
        )

      return response.data.data
    },
    staleTime: 1000 * 60 * 10,
  })
}