import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import type {
  AddMissingEvaluationTopicPayload,
  AddMissingEvaluationTopicResponse,
} from '../types/tracker.types';
import { trackerKeys } from './tracker.keys';

export const useAddMissingEvaluationTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<AddMissingEvaluationTopicResponse, Error, AddMissingEvaluationTopicPayload>({
    mutationFn: async ({ trackerId, evaluationJobId, topicIndex }) => {
      const response = await api.post<AddMissingEvaluationTopicResponse>(
        `/trackers/${trackerId}/evaluation-jobs/${evaluationJobId}/missing-topics/${topicIndex}/add`
      );

      return response.data;
    },

    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['roadmap-evaluation-result', variables.evaluationJobId],
        }),
        queryClient.invalidateQueries({
          queryKey: trackerKeys.roadmap(variables.trackerId),
        }),
        queryClient.invalidateQueries({
          queryKey: trackerKeys.detail(variables.trackerId),
        }),
        queryClient.invalidateQueries({
          queryKey: trackerKeys.summary(),
        }),
        queryClient.invalidateQueries({
          queryKey: trackerKeys.lists(),
        }),
      ]);
    },
  });
};
