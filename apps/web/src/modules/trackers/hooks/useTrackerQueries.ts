import { keepPreviousData, useQuery } from '@tanstack/react-query'

import api from '../../../lib/axios'
import type {
  ApiResponse,
  LessonAnswerAttempt,
  LessonCodeSubmission,
  LessonCodeSubmissionAction,
  LessonGeneratedQuestion,
  LessonQuestionSolution,
  LessonQuestionSolutionDoubt,
  PersistedLessonChatMessage,
  Tracker,
  TrackerLessonResponse,
  TrackerListQuery,
  TrackerListResponse,
  TrackerRoadmapResponse,
  TrackerSummary,
} from '../types/tracker.types'
import { trackerKeys } from './tracker.keys'

const unwrap = <T>(response: ApiResponse<T>) => response.data

export const useTrackerSummary = () => {
  return useQuery({
    queryKey: trackerKeys.summary(),

    queryFn: async () => {
      const response =
        await api.get<ApiResponse<TrackerSummary>>('/trackers/summary')

      return unwrap(response.data)
    },
  })
}

export const useTrackers = (query: TrackerListQuery = {}) => {
  return useQuery({
    queryKey: trackerKeys.list(query),

    queryFn: async () => {
      const response = await api.get<ApiResponse<TrackerListResponse>>(
        '/trackers',
        {
          params: query,
        }
      )

      return unwrap(response.data)
    },

    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export const useTrackerDetails = (trackerId?: string) => {
  return useQuery({
    queryKey: trackerKeys.detail(trackerId || ''),
    enabled: Boolean(trackerId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<Tracker>>(
        `/trackers/${trackerId}`
      )

      return unwrap(response.data)
    },
  })
}

export const useTrackerRoadmap = (trackerId?: string) => {
  return useQuery({
    queryKey: trackerKeys.roadmap(trackerId || ''),
    enabled: Boolean(trackerId),
    refetchOnWindowFocus: true,

    queryFn: async () => {
      const response = await api.get<ApiResponse<TrackerRoadmapResponse>>(
        `/trackers/${trackerId}/roadmap`
      )

      return unwrap(response.data)
    },
  })
}

export const useTrackerLesson = (trackerId?: string, subtopicId?: string) => {
  return useQuery({
    queryKey: trackerKeys.lesson(trackerId || '', subtopicId || ''),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<TrackerLessonResponse>>(
        `/trackers/${trackerId}/lessons/${subtopicId}`
      )

      return unwrap(response.data)
    },
  })
}

export const useLessonChatHistory = (
  trackerId?: string,
  subtopicId?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lessonChat(trackerId || '', subtopicId || ''),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<PersistedLessonChatMessage[]>>(
        `/trackers/${trackerId}/lessons/${subtopicId}/chat`
      )

      return unwrap(response.data)
    },
  })
}

export const useLessonAnswerAttempts = (
  trackerId?: string,
  subtopicId?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lessonAnswerAttempts(
      trackerId || '',
      subtopicId || ''
    ),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<LessonAnswerAttempt[]>>(
        `/trackers/${trackerId}/lessons/${subtopicId}/answer/attempts`
      )

      return unwrap(response.data)
    },
  })
}

export const useLessonCodeSubmissions = (
  trackerId?: string,
  subtopicId?: string,
  action?: LessonCodeSubmissionAction
) => {
  return useQuery({
    queryKey: trackerKeys.lessonCodeSubmissions(
      trackerId || '',
      subtopicId || '',
      action
    ),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<LessonCodeSubmission[]>>(
        `/trackers/${trackerId}/lessons/${subtopicId}/code/submissions`,
        {
          params: action ? { action } : undefined,
        }
      )

      return unwrap(response.data)
    },
  })
}

export const useLessonGeneratedQuestions = (
  trackerId?: string,
  subtopicId?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lessonGeneratedQuestions(
      trackerId || '',
      subtopicId || ''
    ),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<LessonGeneratedQuestion[]>>(
        `/trackers/${trackerId}/lessons/${subtopicId}/questions`
      )

      return unwrap(response.data)
    },
  })
}

export const useLessonQuestionSolution = (
  trackerId?: string,
  subtopicId?: string,
  question?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lessonQuestionSolution(
      trackerId || '',
      subtopicId || '',
      question || ''
    ),
    enabled: Boolean(trackerId && subtopicId && question),

    queryFn: async () => {
      const response = await api.get<ApiResponse<LessonQuestionSolution | null>>(
        `/trackers/${trackerId}/lessons/${subtopicId}/question-solution`,
        {
          params: {
            question,
          },
        }
      )

      return unwrap(response.data)
    },
  })
}

export const useLessonQuestionSolutionDoubts = (
  trackerId?: string,
  subtopicId?: string,
  question?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lessonQuestionSolutionDoubts(
      trackerId || '',
      subtopicId || '',
      question || ''
    ),
    enabled: Boolean(trackerId && subtopicId && question),

    queryFn: async () => {
      const response = await api.get<
        ApiResponse<LessonQuestionSolutionDoubt[]>
      >(
        `/trackers/${trackerId}/lessons/${subtopicId}/question-solution/doubts`,
        {
          params: {
            question,
          },
        }
      )

      return unwrap(response.data)
    },
  })
}

