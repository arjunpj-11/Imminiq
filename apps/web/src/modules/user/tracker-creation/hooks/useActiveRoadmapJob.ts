import { useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';
import { trackerCreationKeys } from './tracker-creation.query-keys';

interface IActiveRoadmapJobResponse {
  success: boolean;
  message: string;
  data: { jobId: string; status: 'pending' | 'processing' } | null;
}

export const useActiveRoadmapJob = () =>
  useQuery({
    queryKey: trackerCreationKeys.activeRoadmapJob(),
    queryFn: async () => {
      const response = await api.get<IActiveRoadmapJobResponse>(
        TRACKER_CREATION_API_PATHS.activeRoadmapJob
      );
      return response.data.data;
    },
    staleTime: 2_000,
    refetchOnWindowFocus: true,
  });
