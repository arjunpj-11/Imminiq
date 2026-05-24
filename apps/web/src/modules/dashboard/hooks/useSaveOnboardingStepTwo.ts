import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'

export type OnboardingLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

interface SaveOnboardingStepTwoPayload {
  level: OnboardingLevel
}

interface SaveOnboardingStepTwoResponse {
  success: boolean
  message: string
  data?: {
    onboardingSessionId?: string
    completedStep?: number
    nextStep?: string
    readyToGenerate?: boolean
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

export const useSaveOnboardingStepTwo = () => {
  return useMutation<
    SaveOnboardingStepTwoResponse,
    AxiosError<ApiErrorResponse>,
    SaveOnboardingStepTwoPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<SaveOnboardingStepTwoResponse>(
          '/onboarding/step-2',
          payload
        )

      return response.data
    },
  })
}

