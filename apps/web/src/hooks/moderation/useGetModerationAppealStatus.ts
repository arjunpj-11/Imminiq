import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type {
  ModerationAppealApiErrorResponse,
  ModerationAppealStatus,
} from './useSubmitModerationAppeal'

export interface GetModerationAppealStatusPayload {
  identifier: string
}

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

    enabled: Boolean(identifier.trim()),

    queryFn: async () => {
      const response =
        await api.post<GetModerationAppealStatusResponse>(
          '/moderation-appeals/status',
          {
            identifier: identifier.trim(),
          } satisfies GetModerationAppealStatusPayload
        )

      return response.data
    },

    retry: false,
    refetchOnWindowFocus: false,
  })
}