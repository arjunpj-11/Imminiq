// apps/web/src/hooks/dashboard/useDashboardRecentBattles.ts

import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { DASHBOARD_API_PATHS } from '../constants/dashboard.constants';
import { dashboardKeys } from './dashboard.query-keys';
import type { IApiResponse, IDashboardRecentBattle } from '../types/dashboard.types';

export const useDashboardRecentBattles = (limit = 3) => {
  return useQuery({
    queryKey: dashboardKeys.recentBattles(limit),
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardRecentBattle[]>>(
        DASHBOARD_API_PATHS.recentBattles,
        {
          params: { limit },
        }
      );

      return response.data.data;
    },
  });
};
