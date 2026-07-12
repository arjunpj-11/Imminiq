import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import type {
  IApiErrorResponse,
  IApiResponse,
  IVoteVerificationSubmissionData,
  IVoteVerificationSubmissionPayload,
} from '../types/community.types'

const voteVerificationSubmission = async (
  payload: IVoteVerificationSubmissionPayload,
): Promise<IVoteVerificationSubmissionData> => {
  const response = await api.post<IApiResponse<IVoteVerificationSubmissionData>>(
    `/community/verify/${payload.submissionId}/vote`,
    {
      vote: payload.vote,
      reason: payload.reason || undefined,
    },
  )

  if (!response.data.data) {
    throw new Error('Verification vote result was not returned.')
  }

  return response.data.data
}

export const useVoteVerificationSubmission = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IVoteVerificationSubmissionData,
    AxiosError<IApiErrorResponse>,
    IVoteVerificationSubmissionPayload
  >({
    mutationFn: voteVerificationSubmission,
    onSuccess: (_data, payload) => {
      void queryClient.invalidateQueries({ queryKey: ['community', 'verify'] })
      void queryClient.invalidateQueries({
        queryKey: ['community', 'verify', 'submission', payload.submissionId],
      })
    },
  })
}
