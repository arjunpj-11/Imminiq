import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../lib/axios';
import type { IApiErrorResponse, IApiResponse, IStreakSummary } from '../../modules/user/users';
import { streakQueryKeys } from './streak.query-keys';

interface IUseStreakOptions {
  enabled?: boolean;
}

export const useStreak = (year?: number, options: IUseStreakOptions = {}) => {
  return useQuery<IApiResponse<IStreakSummary>, AxiosError<IApiErrorResponse>, IStreakSummary>({
    queryKey: streakQueryKeys.me(year),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IStreakSummary>>('/users/me/streak', {
        params: year ? { year } : undefined,
      });

      return response.data;
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 10,
  });
};
