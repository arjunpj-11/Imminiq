import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import {
  LEADERBOARD_ENDPOINTS,
  LEADERBOARD_STALE_TIME_MS,
} from '../constants/leaderboard.constants';
import type {
  ILeaderboardApiErrorResponse,
  ILeaderboardApiResponse,
  ILeaderboardQueryInput,
  ILeaderboardResponse,
} from '../types/leaderboard.types';
import { leaderboardQueryKeys } from './leaderboard.query-keys';

export const useLeaderboard = (input: ILeaderboardQueryInput) =>
  useQuery<ILeaderboardResponse, AxiosError<ILeaderboardApiErrorResponse>>({
    queryKey: leaderboardQueryKeys.list(input),
    queryFn: async () => {
      const response = await api.get<ILeaderboardApiResponse<ILeaderboardResponse>>(
        LEADERBOARD_ENDPOINTS.leaderboard,
        {
          params: {
            section: input.section,
            scope: input.scope,
            limit: input.limit,
          },
        }
      );

      return response.data.data;
    },
    staleTime: LEADERBOARD_STALE_TIME_MS,
    retry: 1,
    placeholderData: keepPreviousData,
  });
