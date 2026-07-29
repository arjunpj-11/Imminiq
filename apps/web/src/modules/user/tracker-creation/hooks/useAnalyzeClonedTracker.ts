import { useMutation } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';

type AnalysisResponse = {
  success: boolean;
  message: string;
  data: { jobId: string };
};

export const useAnalyzeClonedTracker = () =>
  useMutation<AnalysisResponse, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<AnalysisResponse>(
        TRACKER_CREATION_API_PATHS.analyzeClonedTracker(trackerId)
      );
      return response.data;
    },
  });
