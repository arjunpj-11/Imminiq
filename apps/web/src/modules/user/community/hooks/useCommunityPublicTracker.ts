import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { COMMUNITY_ENDPOINTS } from '../constants/community.constants';
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityPublicTrackerDetail,
  ICommunityPublicTrackerDetailData,
} from '../types/community.types';
import { communityKeys } from './community.query-keys';

const fetchCommunityPublicTracker = async (
  trackerId: string
): Promise<ICommunityPublicTrackerDetail> => {
  const response = await api.get<IApiResponse<ICommunityPublicTrackerDetailData>>(
    COMMUNITY_ENDPOINTS.tracker(trackerId)
  );

  const tracker = response.data.data?.tracker;

  if (!tracker) {
    throw new Error('Community tracker detail was not returned.');
  }

  return tracker;
};

export const useCommunityPublicTracker = (trackerId?: string) => {
  return useQuery<ICommunityPublicTrackerDetail, AxiosError<IApiErrorResponse>>({
    queryKey: communityKeys.tracker(trackerId ?? ''),
    queryFn: () => fetchCommunityPublicTracker(trackerId ?? ''),
    enabled: Boolean(trackerId),
    staleTime: 30 * 1000,
  });
};
