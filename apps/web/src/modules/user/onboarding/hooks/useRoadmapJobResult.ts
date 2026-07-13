import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../../lib/axios'

export interface IRoadmapSubtopic {
  _id?: string
  title: string
  description?: string
  order?: number
  depth?: number
  isLocked?: boolean
  locked?: boolean
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  level?: 'beginner' | 'intermediate' | 'advanced'
  children?: IRoadmapSubtopic[]
  subtopics?: IRoadmapSubtopic[]
}

export interface IRoadmapTopic {
  _id: string
  title: string
  description?: string
  order?: number
  status?: string
  subtopicsCount?: number
  children?: IRoadmapSubtopic[]
  subtopics?: IRoadmapSubtopic[]
}

export interface IRoadmapTracker {
  _id: string
  title: string
  description?: string
  field?: string
  goal?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: string
  status?: string
  topicsCount?: number
  subtopicsCount?: number
  progressPercent?: number
  createdAt?: string
  topics?: IRoadmapTopic[]
}

interface IRoadmapJobResultData {
  jobId?: string
  status?: string
  tracker?: IRoadmapTracker
  topics?: IRoadmapTopic[]
}

interface IRoadmapJobResultResponse {
  success: boolean
  message: string
  data?: IRoadmapJobResultData
}

interface IApiErrorResponse {
  success?: boolean
  message?: string
}

export const useRoadmapJobResult = (jobId?: string) => {
  return useQuery<
    IRoadmapJobResultResponse,
    AxiosError<IApiErrorResponse>
  >({
    queryKey: ['roadmap-job-result', jobId],

    queryFn: async () => {
      const response = await api.get<IRoadmapJobResultResponse>(
        `/onboarding/jobs/${jobId}/result`
      )

      return response.data
    },

    enabled: Boolean(jobId),
    retry: 1,
    refetchOnWindowFocus: false,
  })
}