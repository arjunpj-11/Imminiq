import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import { getBlockedAppealToken } from '../../lib/blockedAppealSession'
import type {
  ModerationAppealApiErrorResponse,
  ModerationAppealStatus,
} from './useSubmitModerationAppeal'

export interface GetModerationAppealStatusResponse {
  success: boolean
  message: string
  data?: {
    exists: boolean
    appeal: ModerationAppealStatus | null
  }
}

export const useGetModerationAppealStatus = (
  identifier: string
) => {
  return useQuery<
    GetModerationAppealStatusResponse,
    AxiosError<ModerationAppealApiErrorResponse>
  >({
    queryKey: ['moderation-appeal-status', identifier],

    enabled: Boolean(identifier.trim() && getBlockedAppealToken()),

    queryFn: async () => {
      const response =
        await api.post<GetModerationAppealStatusResponse>(
          '/moderation-appeals/status',
          {},
          { headers: { Authorization: `Bearer ${getBlockedAppealToken()}` } },
        )

      return response.data
    },

    retry: false,
    refetchOnWindowFocus: false,
  })
}
