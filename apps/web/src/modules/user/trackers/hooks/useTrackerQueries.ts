import { keepPreviousData, useQuery } from '@tanstack/react-query'

import api from '../../../../lib/axios'
import type {
  IApiResponse,
  LessonAnswerAttempt,
  LessonCodeSubmission,
  LessonCodeSubmissionAction,
  LessonGeneratedQuestion,
  LessonQuestionSolution,
  LessonQuestionSolutionDoubt,
  PersistedLessonChatMessage,
  ITracker,
  ITrackerLessonResponse,
  ITrackerListQuery,
  ITrackerListResponse,
  ITrackerRoadmapResponse,
  ITrackerSummary,
} from '../types/tracker.types'
import { trackerKeys } from './tracker.keys'

const unwrap = <T>(response: IApiResponse<T>) => response.data

export const useTrackerSummary = () => {
  return useQuery({
    queryKey: trackerKeys.summary(),

    queryFn: async () => {
      const response =
        await api.get<IApiResponse<ITrackerSummary>>('/trackers/summary')

      return unwrap(response.data)
    },
  })
}

export const useTrackers = (query: ITrackerListQuery = {}) => {
  return useQuery({
    queryKey: trackerKeys.list(query),

    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerListResponse>>(
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
      const response = await api.get<IApiResponse<ITracker>>(
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
      const response = await api.get<IApiResponse<ITrackerRoadmapResponse>>(
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
      const response = await api.get<IApiResponse<ITrackerLessonResponse>>(
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
      const response = await api.get<IApiResponse<PersistedLessonChatMessage[]>>(
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
      const response = await api.get<IApiResponse<LessonAnswerAttempt[]>>(
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
      const response = await api.get<IApiResponse<LessonCodeSubmission[]>>(
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
      const response = await api.get<IApiResponse<LessonGeneratedQuestion[]>>(
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
      const response = await api.get<IApiResponse<LessonQuestionSolution | null>>(
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
        IApiResponse<LessonQuestionSolutionDoubt[]>
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

