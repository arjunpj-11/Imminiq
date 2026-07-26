import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { DASHBOARD_API_PATHS } from '../constants/dashboard.constants';
import { dashboardKeys } from './dashboard.query-keys';
import type { IApiResponse, IDashboardCurrentRoadmap } from '../types/dashboard.types';

export const useCurrentDashboardRoadmap = () => {
  return useQuery({
    queryKey: dashboardKeys.currentRoadmap(),
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardCurrentRoadmap | null>>(
        DASHBOARD_API_PATHS.currentRoadmap
      );

      return response.data.data;
    },
  });
};
