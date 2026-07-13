import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '../../../../lib/axios'
import type {
  IAdaptiveAdvisorMessage,
  IAdaptiveApiResponse,
  IAdaptiveAssessment,
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
          assessment: IAdaptiveAssessment
          test: { testId: string; title: string }
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
        IAdaptiveApiResponse<{ message: IAdaptiveAdvisorMessage }>
      >('/adaptive-learning/advisor/chat', { question })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adaptiveLearningKeys.all })
    },
  })
}
