import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';
import { trackerCreationKeys } from './tracker-creation.query-keys';

export type MissingRoadmapTopic = {
  title: string;
  description: string;
  reason: string;
  suggestedParentTitle: string;
  isAdded?: boolean;
  addedSubtopicId?: string;
  addedAt?: string;
};

export type RoadmapEvaluation = {
  score: number;

  grade: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';

  summary: string;

  missingTopics: MissingRoadmapTopic[];
};

type RoadmapEvaluationResultResponse = {
  success: boolean;
  message: string;
  data: {
    jobId: string;
    trackerId: string | null;
    evaluation: RoadmapEvaluation;
  };
};

export const useRoadmapEvaluationResult = (jobId?: string) => {
  return useQuery<RoadmapEvaluationResultResponse>({
    queryKey: trackerCreationKeys.evaluationResult(jobId || ''),

    queryFn: async () => {
      const response = await api.get<RoadmapEvaluationResultResponse>(
        TRACKER_CREATION_API_PATHS.evaluationResult(jobId || '')
      );

      return response.data;
    },

    enabled: Boolean(jobId),
  });
};
