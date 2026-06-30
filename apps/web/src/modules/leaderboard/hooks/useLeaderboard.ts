import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import {
  LEADERBOARD_ENDPOINTS,
  LEADERBOARD_STALE_TIME_MS,
} from '../constants/leaderboard.constants'
import type {
  LeaderboardApiErrorResponse,
  LeaderboardApiResponse,
  LeaderboardQueryInput,
  LeaderboardResponse,
} from '../types/leaderboard.types'

export const leaderboardQueryKeys = {
  all: ['leaderboard'] as const,
  lists: () => [...leaderboardQueryKeys.all, 'list'] as const,
  list: (input: LeaderboardQueryInput) =>
    [
      ...leaderboardQueryKeys.lists(),
      input.section,
      input.scope,
      input.limit,
    ] as const,
  rewards: () => [...leaderboardQueryKeys.all, 'rewards'] as const,
}

export const useLeaderboard = (input: LeaderboardQueryInput) =>
  useQuery<
    LeaderboardResponse,
    AxiosError<LeaderboardApiErrorResponse>
  >({
    queryKey: leaderboardQueryKeys.list(input),
    queryFn: async () => {
      const response = await api.get<
        LeaderboardApiResponse<LeaderboardResponse>
      >(LEADERBOARD_ENDPOINTS.leaderboard, {
        params: {
          section: input.section,
          scope: input.scope,
          limit: input.limit,
        },
      })

      return response.data.data
    },
    staleTime: LEADERBOARD_STALE_TIME_MS,
    retry: 1,
    placeholderData: keepPreviousData,
  })