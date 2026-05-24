// apps/web/src/hooks/dashboard/useDashboardSummary.ts

import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import type {
  ApiResponse,
  DashboardSummary,
} from '../types/dashboard.types'

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<DashboardSummary>>(
          '/dashboard/summary'
        )

      return response.data.data
    },
  })
}