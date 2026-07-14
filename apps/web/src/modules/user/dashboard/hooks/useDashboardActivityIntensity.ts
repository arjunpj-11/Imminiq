// apps/web/src/hooks/dashboard/useDashboardActivityIntensity.ts

import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { DASHBOARD_API_PATHS } from '../constants/dashboard.constants';
import { dashboardKeys } from './dashboard.query-keys';
import type { IApiResponse, IDashboardActivityIntensityItem } from '../types/dashboard.types';

export const useDashboardActivityIntensity = (months: 6 | 12) => {
  return useQuery({
    queryKey: dashboardKeys.activityIntensity(months),
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardActivityIntensityItem[]>>(
        DASHBOARD_API_PATHS.activityIntensity,
        {
          params: { months },
        }
      );

      return response.data.data;
    },
  });
};
