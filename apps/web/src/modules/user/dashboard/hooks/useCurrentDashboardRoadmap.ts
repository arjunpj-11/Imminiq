// apps/web/src/hooks/dashboard/useCurrentDashboardRoadmap.ts

import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { IApiResponse, IDashboardCurrentRoadmap } from '../types/dashboard.types';

export const useCurrentDashboardRoadmap = () => {
  return useQuery({
    queryKey: ['dashboard', 'current-roadmap'],
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardCurrentRoadmap | null>>(
        '/dashboard/current-roadmap'
      );

      return response.data.data;
    },
  });
};
