import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type { OnboardingLevel } from './useSaveOnboardingStepTwo'

interface GenerateRoadmapPayload {
  topic: string
  goal?: string
  level: OnboardingLevel
}

interface GenerateRoadmapResponse {
  success: boolean
  message: string
  data?: {
    jobId?: string
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

export const useGenerateRoadmap = () => {
  return useMutation<
    GenerateRoadmapResponse,
    AxiosError<ApiErrorResponse>,
    GenerateRoadmapPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<GenerateRoadmapResponse>(
        '/onboarding/generate-roadmap',
        payload
      )

      return response.data
    },
  })
}