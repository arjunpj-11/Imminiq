import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'

export type EvaluationJobStep = {
  stepNumber: number
  stepLabel: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  startedAt: string | null
  completedAt: string | null
}

export type EvaluationJobStatus = {
  jobId: string
  jobType?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  currentStepNumber: number
  currentStep: string
  completedSteps: number
  totalSteps: number
  steps: EvaluationJobStep[]
  trackerId?: string | null
  errorMessage?: string | null
}

type EvaluationJobStatusResponse = {
  success: boolean
  message: string
  data: EvaluationJobStatus
}

export const useRoadmapEvaluationJobStatus = (
  jobId?: string
) => {
  return useQuery<EvaluationJobStatusResponse>({
    queryKey: ['roadmap-evaluation-job-status', jobId],

    queryFn: async () => {
      const response =
        await api.get<EvaluationJobStatusResponse>(
          `/onboarding/jobs/${jobId}/status`
        )

      return response.data
    },

    enabled: Boolean(jobId),

    refetchInterval: (query) => {
      const status = query.state.data?.data.status

      if (
        status === 'completed' ||
        status === 'failed'
      ) {
        return false
      }

      return 1500
    },
  })
}