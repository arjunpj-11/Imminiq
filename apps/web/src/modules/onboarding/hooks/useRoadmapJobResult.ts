import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'

export interface RoadmapSubtopic {
  _id?: string
  title: string
  description?: string
  order?: number
  depth?: number
  isLocked?: boolean
  locked?: boolean
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  level?: 'beginner' | 'intermediate' | 'advanced'
  children?: RoadmapSubtopic[]
  subtopics?: RoadmapSubtopic[]
}

export interface RoadmapTopic {
  _id: string
  title: string
  description?: string
  order?: number
  status?: string
  subtopicsCount?: number
  children?: RoadmapSubtopic[]
  subtopics?: RoadmapSubtopic[]
}

export interface RoadmapTracker {
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
  topics?: RoadmapTopic[]
}

interface RoadmapJobResultData {
  jobId?: string
  status?: string
  tracker?: RoadmapTracker
  topics?: RoadmapTopic[]
}

interface RoadmapJobResultResponse {
  success: boolean
  message: string
  data?: RoadmapJobResultData
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

export const useRoadmapJobResult = (jobId?: string) => {
  return useQuery<
    RoadmapJobResultResponse,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ['roadmap-job-result', jobId],

    queryFn: async () => {
      const response = await api.get<RoadmapJobResultResponse>(
        `/onboarding/jobs/${jobId}/result`
      )

      return response.data
    },

    enabled: Boolean(jobId),
    retry: 1,
    refetchOnWindowFocus: false,
  })
}