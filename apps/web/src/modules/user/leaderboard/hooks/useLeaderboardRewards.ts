import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import {
  LEADERBOARD_ENDPOINTS,
  LEADERBOARD_STALE_TIME_MS,
} from '../constants/leaderboard.constants';
import type {
  ILeaderboardApiErrorResponse,
  ILeaderboardApiResponse,
  ILeaderboardRewardsResponse,
} from '../types/leaderboard.types';
import { leaderboardQueryKeys } from './leaderboard.query-keys';

export const useLeaderboardRewards = () =>
  useQuery<ILeaderboardRewardsResponse, AxiosError<ILeaderboardApiErrorResponse>>({
    queryKey: leaderboardQueryKeys.rewards(),
    queryFn: async () => {
      const response = await api.get<ILeaderboardApiResponse<ILeaderboardRewardsResponse>>(
        LEADERBOARD_ENDPOINTS.rewards
      );

      return response.data.data;
    },
    staleTime: LEADERBOARD_STALE_TIME_MS,
    retry: 1,
  });
