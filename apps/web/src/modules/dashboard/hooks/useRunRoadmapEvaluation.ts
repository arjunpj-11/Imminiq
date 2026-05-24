import { useMutation } from '@tanstack/react-query'
import api from '../../../lib/axios'

type RunRoadmapEvaluationResponse = {
  success: boolean
  message: string
  data: {
    jobId: string
  }
}

export const useRunRoadmapEvaluation = () => {
  return useMutation<
    RunRoadmapEvaluationResponse,
    Error,
    string
  >({
    mutationFn: async (roadmapJobId: string) => {
      const response =
        await api.post<RunRoadmapEvaluationResponse>(
          `/onboarding/jobs/${roadmapJobId}/evaluate`
        )

      return response.data
    },
  })
}