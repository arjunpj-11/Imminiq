// apps/web/src/hooks/dashboard/useDashboardAIInsights.ts

import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { DASHBOARD_API_PATHS } from '../constants/dashboard.constants';
import { dashboardKeys } from './dashboard.query-keys';
import type { IApiResponse, IDashboardAIInsight } from '../types/dashboard.types';

export const useDashboardAIInsights = () => {
  return useQuery({
    queryKey: dashboardKeys.aiInsights(),
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardAIInsight>>(
        DASHBOARD_API_PATHS.aiInsights
      );

      return response.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};
