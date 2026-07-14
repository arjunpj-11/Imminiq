import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../../lib/axios';
import { PROFILE_API_PATHS } from '../../constants/profile-api.constants';
import type {
  IApiErrorResponse,
  IApiResponse,
  IPaginatedResult,
  IPublishedTracker,
} from '../../types/profile.types';
import { profileQueryKeys } from '../profile.query-keys';

export interface IPublishedTrackerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'draft' | 'archived';
  sort?: 'createdAt' | 'publishedAt' | 'ratingAverage' | 'cloneCount';
}

interface IUsePublishedTrackersOptions {
  enabled?: boolean;
}

export const usePublishedTrackers = (
  params: IPublishedTrackerQuery = { page: 1, limit: 6 },
  options: IUsePublishedTrackersOptions = {}
) => {
  const normalizedParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 6,
    search: params.search ?? '',
    status: params.status,
    sort: params.sort ?? 'publishedAt',
  };

  return useQuery<
    IApiResponse<IPaginatedResult<IPublishedTracker>>,
    AxiosError<IApiErrorResponse>,
    IPaginatedResult<IPublishedTracker>
  >({
    queryKey: profileQueryKeys.trackers(normalizedParams),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IPaginatedResult<IPublishedTracker>>>(
        PROFILE_API_PATHS.publishedTrackers,
        {
          params: normalizedParams,
        }
      );

      return response.data;
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  });
};
