import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityVerificationSubmission,
} from '../types/community.types';

interface IVerificationSubmissionData {
  submission: ICommunityVerificationSubmission;
}

const fetchVerificationSubmission = async (
  submissionId: string
): Promise<IVerificationSubmissionData> => {
  const response = await api.get<IApiResponse<IVerificationSubmissionData>>(
    `/community/verify/${submissionId}`
  );

  if (!response.data.data) {
    throw new Error('Verification submission was not returned.');
  }

  return response.data.data;
};

export const useVerificationSubmission = (submissionId?: string) => {
  return useQuery<IVerificationSubmissionData, AxiosError<IApiErrorResponse>>({
    queryKey: ['community', 'verify', 'submission', submissionId],
    queryFn: () => fetchVerificationSubmission(submissionId || ''),
    enabled: Boolean(submissionId),
    staleTime: 15 * 1000,
  });
};
