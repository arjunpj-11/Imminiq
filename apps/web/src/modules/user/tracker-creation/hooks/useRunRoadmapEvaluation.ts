import { useMutation } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';

type RunRoadmapEvaluationResponse = {
  success: boolean;
  message: string;
  data: {
    jobId: string;
  };
};

export const useRunRoadmapEvaluation = () => {
  return useMutation<RunRoadmapEvaluationResponse, Error, string>({
    mutationFn: async (roadmapJobId: string) => {
      const response = await api.post<RunRoadmapEvaluationResponse>(
        TRACKER_CREATION_API_PATHS.evaluateJob(roadmapJobId)
      );

      return response.data;
    },
  });
};
