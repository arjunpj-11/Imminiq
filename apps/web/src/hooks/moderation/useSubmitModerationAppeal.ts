import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import { getBlockedAppealToken } from '../../lib/blockedAppealSession'

export interface SubmitModerationAppealPayload {
  appealReason: string
}

export interface ModerationAppealStatus {
  caseId: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  submittedAt: string
  appealReason?: string
}

export interface SubmitModerationAppealResponse {
  success: boolean
  message: string
  data?: ModerationAppealStatus
}

export interface ModerationAppealApiErrorResponse {
  success?: boolean
  message?: string
  code?: string
}

export const useSubmitModerationAppeal = () => {
  return useMutation<
    SubmitModerationAppealResponse,
    AxiosError<ModerationAppealApiErrorResponse>,
    SubmitModerationAppealPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<SubmitModerationAppealResponse>(
          '/moderation-appeals',
          payload,
          { headers: { Authorization: `Bearer ${getBlockedAppealToken()}` } },
        )

      return response.data
    },
  })
}
