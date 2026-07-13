import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityPublicTrackerDetail,
  ICommunityPublicTrackerDetailData,
} from '../types/community.types';

export const communityPublicTrackerKeys = {
  all: ['community', 'trackers'] as const,
  detail: (trackerId: string) => [...communityPublicTrackerKeys.all, trackerId] as const,
};

const fetchCommunityPublicTracker = async (
  trackerId: string
): Promise<ICommunityPublicTrackerDetail> => {
  const response = await api.get<IApiResponse<ICommunityPublicTrackerDetailData>>(
    `/community/trackers/${trackerId}`
  );

  const tracker = response.data.data?.tracker;

  if (!tracker) {
    throw new Error('Community tracker detail was not returned.');
  }

  return tracker;
};

export const useCommunityPublicTracker = (trackerId?: string) => {
  return useQuery<ICommunityPublicTrackerDetail, AxiosError<IApiErrorResponse>>({
    queryKey: communityPublicTrackerKeys.detail(trackerId ?? ''),
    queryFn: () => fetchCommunityPublicTracker(trackerId ?? ''),
    enabled: Boolean(trackerId),
    staleTime: 30 * 1000,
  });
};
