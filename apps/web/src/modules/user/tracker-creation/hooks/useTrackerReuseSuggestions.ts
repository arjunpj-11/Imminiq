import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type {
  IApiResponse,
  ICommunityBrowseData,
  ICommunityTracker,
} from '../../community';
import { ONBOARDING_API_PATHS } from '../constants/onboarding.constants';
import { trackerCreationKeys } from './tracker-creation.query-keys';

export const useTrackerReuseSuggestions = (topic?: string) =>
  useQuery<ICommunityTracker[]>({
    queryKey: trackerCreationKeys.reuseSuggestions(topic ?? ''),
    enabled: Boolean(topic?.trim()),
    staleTime: 60_000,
    queryFn: async () => {
      const params = new URLSearchParams({
        search: topic?.trim() ?? '',
        sort: 'top-rated',
        page: '1',
        limit: '3',
      });
      const response = await api.get<IApiResponse<ICommunityBrowseData>>(
        ONBOARDING_API_PATHS.reuseSuggestions(params.toString())
      );
      return response.data.data?.trackers ?? [];
    },
  });
