import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../lib/axios';
import type {
  IActivityFeedItem,
  IApiErrorResponse,
  IApiResponse,
} from '../../modules/user/users';
import { activityQueryKeys } from './activity.query-keys';

interface IRecentActivityResponse {
  items: IActivityFeedItem[];
}

interface IUseRecentActivityOptions {
  enabled?: boolean;
}

export const useRecentActivity = (limit = 10, options: IUseRecentActivityOptions = {}) => {
  return useQuery<
    IApiResponse<IRecentActivityResponse>,
    AxiosError<IApiErrorResponse>,
    IRecentActivityResponse
  >({
    queryKey: activityQueryKeys.recent(limit),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IRecentActivityResponse>>(
        '/users/me/recent-activity',
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
