import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'

export type RoadmapJobTerminalStatus =
  | 'completed'
  | 'failed'
  | 'success'
  | 'done'
  | 'error'

export interface RoadmapJobStatusData {
  jobId?: string
  status?: string
  state?: string

  progress?: number
  progressPercent?: number
  percentage?: number

  currentStep?: number
  step?: number
  completedSteps?: number
  completedStep?: number
  totalSteps?: number

  stepLabel?: string
  currentStepLabel?: string
  progressLabel?: string

  message?: string
  logMessage?: string
  engineLabel?: string
  nextLabel?: string
  nextStep?: string
}

interface RoadmapJobStatusResponse {
  success: boolean
  message: string
  data?: RoadmapJobStatusData
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

const isTerminalJob = (data?: RoadmapJobStatusData) => {
  const status = (data?.status || data?.state || '').toLowerCase()

  return [
    'completed',
    'failed',
    'success',
    'done',
    'error',
  ].includes(status)
}

export const useRoadmapJobStatus = (jobId?: string) => {
  return useQuery<
    RoadmapJobStatusResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ['roadmap-job-status', jobId],

    queryFn: async () => {
      const response = await api.get<RoadmapJobStatusResponse>(
        `/onboarding/jobs/${jobId}/status`
      )

      return response.data
    },

    enabled: Boolean(jobId),

    refetchInterval: (query) => {
      const response = query.state.data

      if (isTerminalJob(response?.data)) {
        return false
      }

      return 1500
    },

    refetchOnWindowFocus: false,
    retry: 1,
  })
}