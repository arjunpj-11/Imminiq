import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'

export type OnboardingLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

interface ISaveOnboardingStepTwoPayload {
  level: OnboardingLevel
}

interface ISaveOnboardingStepTwoResponse {
  success: boolean
  message: string
  data?: {
    onboardingSessionId?: string
    completedStep?: number
    nextStep?: string
    readyToGenerate?: boolean
  }
}

interface IApiErrorResponse {
  success?: boolean
  message?: string
}

export const useSaveOnboardingStepTwo = () => {
  return useMutation<
    ISaveOnboardingStepTwoResponse,
    AxiosError<IApiErrorResponse>,
    ISaveOnboardingStepTwoPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<ISaveOnboardingStepTwoResponse>(
          '/onboarding/step-2',
          payload
        )

      return response.data
    },
  })
}

