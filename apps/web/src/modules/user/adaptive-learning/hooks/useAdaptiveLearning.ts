import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '../../../../lib/axios'
import type {
  IAdaptiveAdvisorMessage,
  IAdaptiveAdvisorAction,
  IAdaptiveApiResponse,
  IAdaptiveDashboard,
} from '../types/adaptive-learning.types'

export const adaptiveLearningKeys = {
  all: ['adaptive-learning'] as const,
  dashboard: () => [...adaptiveLearningKeys.all, 'dashboard'] as const,
}

export const useAdaptiveLearningDashboard = (enabled = true) =>
  useQuery({
    queryKey: adaptiveLearningKeys.dashboard(),
    enabled,
    queryFn: async () => {
      const response = await api.get<IAdaptiveApiResponse<IAdaptiveDashboard>>(
        '/adaptive-learning',
      )
      return response.data.data
    },
    staleTime: 15_000,
  })

export const useGenerateAdaptiveAssessment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<
        IAdaptiveApiResponse<{
          jobId: string
          status: 'pending'
        }>
      >('/adaptive-learning/assessments/generate')
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adaptiveLearningKeys.all })
      queryClient.invalidateQueries({ queryKey: ['mock-tests'] })
    },
  })
}

export const useAdaptiveAdvisorChat = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (question: string) => {
      const response = await api.post<
        IAdaptiveApiResponse<{
          message: IAdaptiveAdvisorMessage
          action?: IAdaptiveAdvisorAction
        }>
      >('/adaptive-learning/advisor/chat', { question })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adaptiveLearningKeys.all })
    },
  })
}

export const useClearAdaptiveAdvisorChat = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete('/adaptive-learning/advisor/messages')
    },
    onSuccess: () => {
      queryClient.setQueryData<IAdaptiveDashboard>(
        adaptiveLearningKeys.dashboard(),
        (current) =>
          current ? { ...current, messages: [] } : current,
      )
      queryClient.invalidateQueries({ queryKey: adaptiveLearningKeys.all })
    },
  })
}
