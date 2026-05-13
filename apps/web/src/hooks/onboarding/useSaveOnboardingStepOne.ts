// apps/web/src/hooks/onboarding/useSaveOnboardingStepOne.ts

import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'

export interface SaveOnboardingStepOnePayload {
  topic: string
  goal?: string
}

export interface SaveOnboardingStepOneResponse {
  success?: boolean
  message: string
  data?: {
    _id?: string
    userId?: string
    preparingFor?: string
    goal?: string
    completedStep?: number
    isCompleted?: boolean
    createdAt?: string
    updatedAt?: string
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

const saveOnboardingStepOne = async (
  payload: SaveOnboardingStepOnePayload
): Promise<SaveOnboardingStepOneResponse> => {
  const response = await api.post<SaveOnboardingStepOneResponse>(
    '/onboarding/step-1',
    payload
  )

  return response.data
}

export const useSaveOnboardingStepOne = () => {
  return useMutation<
    SaveOnboardingStepOneResponse,
    AxiosError<ApiErrorResponse>,
    SaveOnboardingStepOnePayload
  >({
    mutationFn: saveOnboardingStepOne,
  })
}