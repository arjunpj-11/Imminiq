import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_API_PATHS } from '../constants/tracker-api.constants';
import { trackerCreationKeys } from '../../tracker-creation';
import type {
  AddMissingEvaluationTopicPayload,
  AddMissingEvaluationTopicResponse,
} from '../types/tracker.types';
import { trackerKeys } from './trackers.query-keys';

export const useAddMissingEvaluationTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<AddMissingEvaluationTopicResponse, Error, AddMissingEvaluationTopicPayload>({
    mutationFn: async ({ trackerId, evaluationJobId, topicIndex }) => {
      const response = await api.post<AddMissingEvaluationTopicResponse>(
        TRACKER_API_PATHS.addMissingEvaluationTopic(trackerId, evaluationJobId, topicIndex)
      );

      return response.data;
    },

    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trackerCreationKeys.evaluationResult(variables.evaluationJobId),
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
