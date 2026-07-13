import { useMutation } from '@tanstack/react-query'

import api from '../../../../lib/axios'
import type {
  ITrackerIntakeMessage,
  ITrackerIntakeProfile,
} from '../types/onboarding.types'

interface ITrackerIntakeApiResponse {
  success: boolean
  message: string
  data: {
    assistantMessage: string
    isComplete: boolean
    profile?: ITrackerIntakeProfile
  }
}

export const useTrackerIntake = () =>
  useMutation({
    mutationFn: async (messages: ITrackerIntakeMessage[]) => {
      const response = await api.post<ITrackerIntakeApiResponse>(
        '/onboarding/tracker-intake',
        { messages },
      )
      return response.data.data
    },
  })
