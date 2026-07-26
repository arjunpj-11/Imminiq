import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { paginationConfig } from '../../../../../config/pagination';
import api from '../../../../../lib/axios';
import { PROFILE_API_PATHS } from '../../constants/profile-api.constants';
import type {
  IApiErrorResponse,
  IApiResponse,
  IPaginatedResult,
  IProfileBadge,
} from '../../types/profile.types';
import { profileQueryKeys } from '../profile.query-keys';

interface IUseProfileBadgesOptions {
  enabled?: boolean;
}

export const useProfileBadges = (
  page = 1,
  limit = paginationConfig.gridLimit,
  options: IUseProfileBadgesOptions = {}
) => {
  return useQuery<
    IApiResponse<IPaginatedResult<IProfileBadge>>,
    AxiosError<IApiErrorResponse>,
    IPaginatedResult<IProfileBadge>
  >({
    queryKey: profileQueryKeys.badges(page, limit),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IPaginatedResult<IProfileBadge>>>(
        PROFILE_API_PATHS.badges,
        {
          params: { page, limit },
        }
      );

      return response.data;
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 10,
  });
};
