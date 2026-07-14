import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { ONBOARDING_API_PATHS } from '../constants/onboarding.constants';
import { onboardingKeys } from './onboarding.query-keys';

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
    queryKey: onboardingKeys.evaluationResult(jobId || ''),

    queryFn: async () => {
      const response = await api.get<RoadmapEvaluationResultResponse>(
        ONBOARDING_API_PATHS.evaluationResult(jobId || '')
      );

      return response.data;
    },

    enabled: Boolean(jobId),
  });
};
