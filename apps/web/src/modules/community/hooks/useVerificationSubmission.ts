import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  CommunityVerificationSubmission,
} from '../types/community.types'

interface VerificationSubmissionData {
  submission: CommunityVerificationSubmission
}

const fetchVerificationSubmission = async (
  submissionId: string,
): Promise<VerificationSubmissionData> => {
  const response = await api.get<ApiResponse<VerificationSubmissionData>>(
    `/community/verify/${submissionId}`,
  )

  if (!response.data.data) {
    throw new Error('Verification submission was not returned.')
  }

  return response.data.data
}

export const useVerificationSubmission = (submissionId?: string) => {
  return useQuery<VerificationSubmissionData, AxiosError<ApiErrorResponse>>({
    queryKey: ['community', 'verify', 'submission', submissionId],
    queryFn: () => fetchVerificationSubmission(submissionId || ''),
    enabled: Boolean(submissionId),
    staleTime: 15 * 1000,
  })
}
