import { useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';

interface IActiveRoadmapJobResponse {
  success: boolean;
  message: string;
  data: { jobId: string; status: 'pending' | 'processing' } | null;
}

export const useActiveRoadmapJob = () =>
  useQuery({
    queryKey: ['active-roadmap-job'],
    queryFn: async () => {
      const response = await api.get<IActiveRoadmapJobResponse>('/onboarding/roadmap-jobs/active');
      return response.data.data;
    },
    staleTime: 2_000,
    refetchOnWindowFocus: true,
  });
