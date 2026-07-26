import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { paginationConfig } from '../../config/pagination';
import api from '../../lib/axios';
import type { IActivityFeedItem, IApiErrorResponse, IApiResponse } from '../../modules/user/users';
import { activityQueryKeys } from './activity.query-keys';
import { PROFILE_ACTIVITY_ENDPOINTS } from './activity.constants';

interface IRecentActivityResponse {
  items: IActivityFeedItem[];
}

interface IUseRecentActivityOptions {
  enabled?: boolean;
}

export const useRecentActivity = (
  limit = paginationConfig.profileLimit,
  options: IUseRecentActivityOptions = {}
) => {
  return useQuery<
    IApiResponse<IRecentActivityResponse>,
    AxiosError<IApiErrorResponse>,
    IRecentActivityResponse
  >({
    queryKey: activityQueryKeys.recent(limit),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IRecentActivityResponse>>(
        PROFILE_ACTIVITY_ENDPOINTS.recent,
        {
          params: { limit },
        }
      );

      return response.data;
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 3,
  });
};
