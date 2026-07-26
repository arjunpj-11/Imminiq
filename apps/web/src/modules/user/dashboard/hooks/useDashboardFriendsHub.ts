import { useQuery } from '@tanstack/react-query';
import { paginationConfig } from '../../../../config/pagination';
import api from '../../../../lib/axios';
import { DASHBOARD_API_PATHS } from '../constants/dashboard.constants';
import { dashboardKeys } from './dashboard.query-keys';
import type { IApiResponse, IDashboardFriend } from '../types/dashboard.types';

export const useDashboardFriendsHub = (limit = paginationConfig.dashboardFriendLimit) => {
  return useQuery({
    queryKey: dashboardKeys.friendsHub(limit),
    queryFn: async () => {
      const response = await api.get<IApiResponse<IDashboardFriend[]>>(
        DASHBOARD_API_PATHS.friendsHub,
        {
          params: { limit },
        }
      );

      return response.data.data;
    },
  });
};
