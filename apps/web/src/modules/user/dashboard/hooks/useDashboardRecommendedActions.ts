import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { DASHBOARD_API_PATHS } from '../constants/dashboard.constants';
import { dashboardKeys } from './dashboard.query-keys';
import type { IApiResponse, IDashboardRecommendedAction } from '../types/dashboard.types';

export const useDashboardRecommendedActions = () => {
  return useQuery({
    queryKey: dashboardKeys.recommendedActions(),
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardRecommendedAction[]>>(
        DASHBOARD_API_PATHS.recommendedActions
      );

      return response.data.data;
    },
  });
};
