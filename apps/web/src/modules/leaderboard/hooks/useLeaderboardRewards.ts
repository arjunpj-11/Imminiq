import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import {
  LEADERBOARD_ENDPOINTS,
  LEADERBOARD_STALE_TIME_MS,
} from '../constants/leaderboard.constants'
import type {
  LeaderboardApiErrorResponse,
  LeaderboardApiResponse,
  LeaderboardRewardsResponse,
} from '../types/leaderboard.types'
import { leaderboardQueryKeys } from './useLeaderboard'

export const useLeaderboardRewards = () =>
  useQuery<
    LeaderboardRewardsResponse,
    AxiosError<LeaderboardApiErrorResponse>
  >({
    queryKey: leaderboardQueryKeys.rewards(),
    queryFn: async () => {
      const response = await api.get<
        LeaderboardApiResponse<LeaderboardRewardsResponse>
      >(LEADERBOARD_ENDPOINTS.rewards)

      return response.data.data
    },
    staleTime: LEADERBOARD_STALE_TIME_MS,
    retry: 1,
  })
