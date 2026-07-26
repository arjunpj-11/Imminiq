import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { DASHBOARD_API_PATHS } from '../constants/dashboard.constants';
import { dashboardKeys } from './dashboard.query-keys';
import type { IApiResponse, IDashboardSummary } from '../types/dashboard.types';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardSummary>>(DASHBOARD_API_PATHS.summary);

      return response.data.data;
    },
  });
};
