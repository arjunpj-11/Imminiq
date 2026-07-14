import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { ADAPTIVE_LEARNING_API_PATHS } from '../constants/adaptive-learning.constants';
import { adaptiveLearningKeys } from './adaptive-learning.query-keys';
import { mockTestKeys } from '../../mock-tests';
import type {
  IAdaptiveAdvisorMessage,
  AdaptiveAdvisorAction,
  IAdaptiveApiResponse,
  IAdaptiveDashboard,
} from '../types/adaptive-learning.types';

export const useAdaptiveLearningDashboard = (enabled = true) =>
  useQuery({
    queryKey: adaptiveLearningKeys.dashboard(),
    enabled,
    queryFn: async () => {
      const response =
        await api.get<IAdaptiveApiResponse<IAdaptiveDashboard>>(ADAPTIVE_LEARNING_API_PATHS.root);
      return response.data.data;
    },
    staleTime: 15_000,
  });

export const useGenerateAdaptiveAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<
        IAdaptiveApiResponse<{
          jobId: string;
          status: 'pending';
        }>
      >(ADAPTIVE_LEARNING_API_PATHS.generateAssessment);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adaptiveLearningKeys.all });
      queryClient.invalidateQueries({ queryKey: mockTestKeys.all });
    },
  });
};

export const useAdaptiveAdvisorChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (question: string) => {
      const response = await api.post<
        IAdaptiveApiResponse<{
          message: IAdaptiveAdvisorMessage;
          action?: AdaptiveAdvisorAction;
        }>
      >(ADAPTIVE_LEARNING_API_PATHS.advisorChat, { question });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adaptiveLearningKeys.all });
    },
  });
};

export const useClearAdaptiveAdvisorChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(ADAPTIVE_LEARNING_API_PATHS.advisorMessages);
    },
    onSuccess: () => {
      queryClient.setQueryData<IAdaptiveDashboard>(adaptiveLearningKeys.dashboard(), (current) =>
        current ? { ...current, messages: [] } : current
      );
      queryClient.invalidateQueries({ queryKey: adaptiveLearningKeys.all });
    },
  });
};
