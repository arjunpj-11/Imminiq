import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../../lib/axios'
import type { OnboardingLevel } from './useSaveOnboardingStepTwo'

interface IGenerateRoadmapPayload {
  topic: string
  goal?: string
  level: OnboardingLevel
}

interface IGenerateRoadmapResponse {
  success: boolean
  message: string
  data?: {
    jobId?: string
  }
}

interface IApiErrorResponse {
  success?: boolean
  message?: string
}

export const useGenerateRoadmap = () => {
  return useMutation<
    IGenerateRoadmapResponse,
    AxiosError<IApiErrorResponse>,
    IGenerateRoadmapPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<IGenerateRoadmapResponse>(
        '/onboarding/generate-roadmap',
        payload
      )

      return response.data
    },
  })
}