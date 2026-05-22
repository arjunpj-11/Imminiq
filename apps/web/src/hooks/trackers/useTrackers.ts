// apps/web/src/hooks/trackers/useTrackers.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import api from '../../lib/axios'

import type {
  AddMissingEvaluationTopicPayload,
  AddMissingEvaluationTopicResponse,
  ApiResponse,
  CreateSubtopicPayload,
  CreateTopicPayload,
  CreateTrackerPayload,
  GetCodeHintPayload,
  GetCodeHintResponse,
  GetOptimizedSolutionPayload,
  GetOptimizedSolutionResponse,
  LessonChatPayload,
  LessonChatResponse,
  RunLessonCodePayload,
  RunLessonCodeResponse,
  SubmitLessonCodePayload,
  SubmitLessonCodeResponse,
  Tracker,
  TrackerLessonResponse,
  TrackerListQuery,
  TrackerListResponse,
  TrackerRoadmapResponse,
  TrackerSummary,
  UpdateSubtopicProgressPayload,
  UpdateTrackerPayload,
  VerifyLessonAnswerPayload,
  VerifyLessonAnswerResponse,
} from '../../types/tracker.types'

export const trackerKeys = {
  all: ['trackers'] as const,

  summary: () =>
    [...trackerKeys.all, 'summary'] as const,

  lists: () =>
    [...trackerKeys.all, 'list'] as const,

  list: (query: TrackerListQuery) =>
    [...trackerKeys.lists(), query] as const,

  details: () =>
    [...trackerKeys.all, 'detail'] as const,

  detail: (trackerId: string) =>
    [...trackerKeys.details(), trackerId] as const,

  roadmap: (trackerId: string) =>
    [...trackerKeys.detail(trackerId), 'roadmap'] as const,

  lesson: (trackerId: string, subtopicId: string) =>
    [
      ...trackerKeys.detail(trackerId),
      'lesson',
      subtopicId,
    ] as const,
}

const unwrap = <T>(response: ApiResponse<T>) => {
  return response.data
}

export const useTrackerSummary = () => {
  return useQuery({
    queryKey: trackerKeys.summary(),

    queryFn: async () => {
      const response =
        await api.get<ApiResponse<TrackerSummary>>(
          '/trackers/summary'
        )

      return unwrap(response.data)
    },
  })
}

export const useTrackers = (
  query: TrackerListQuery = {}
) => {
  return useQuery({
    queryKey: trackerKeys.list(query),

    queryFn: async () => {
      const response =
        await api.get<ApiResponse<TrackerListResponse>>(
          '/trackers',
          {
            params: query,
          }
        )

      return unwrap(response.data)
    },
  })
}

export const useTrackerDetails = (
  trackerId?: string
) => {
  return useQuery({
    queryKey: trackerKeys.detail(trackerId || ''),
    enabled: Boolean(trackerId),

    queryFn: async () => {
      const response =
        await api.get<ApiResponse<Tracker>>(
          `/trackers/${trackerId}`
        )

      return unwrap(response.data)
    },
  })
}

export const useTrackerRoadmap = (
  trackerId?: string
) => {
  return useQuery({
    queryKey: trackerKeys.roadmap(trackerId || ''),
    enabled: Boolean(trackerId),

    queryFn: async () => {
      const response =
        await api.get<ApiResponse<TrackerRoadmapResponse>>(
          `/trackers/${trackerId}/roadmap`
        )

      return unwrap(response.data)
    },
  })
}

export const useTrackerLesson = (
  trackerId?: string,
  subtopicId?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lesson(
      trackerId || '',
      subtopicId || ''
    ),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response =
        await api.get<ApiResponse<TrackerLessonResponse>>(
          `/trackers/${trackerId}/lessons/${subtopicId}`
        )

      return unwrap(response.data)
    },
  })
}

export const useCreateTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<Tracker>,
    Error,
    CreateTrackerPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<ApiResponse<Tracker>>(
          '/trackers',
          payload
        )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useUpdateTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<Tracker>,
    Error,
    UpdateTrackerPayload
  >({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response =
        await api.patch<ApiResponse<Tracker>>(
          `/trackers/${trackerId}`,
          payload
        )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })
    },
  })
}

export const useDeleteTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Tracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response =
        await api.delete<ApiResponse<Tracker>>(
          `/trackers/${trackerId}`
        )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useArchiveTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Tracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response =
        await api.post<ApiResponse<Tracker>>(
          `/trackers/${trackerId}/archive`
        )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useRestoreTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Tracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response =
        await api.post<ApiResponse<Tracker>>(
          `/trackers/${trackerId}/restore`
        )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const usePublishTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Tracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response =
        await api.post<ApiResponse<Tracker>>(
          `/trackers/${trackerId}/publish`
        )

      return response.data
    },

    onSuccess: (_response, trackerId) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(trackerId),
      })
    },
  })
}

export const useUnpublishTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Tracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response =
        await api.post<ApiResponse<Tracker>>(
          `/trackers/${trackerId}/unpublish`
        )

      return response.data
    },

    onSuccess: (_response, trackerId) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(trackerId),
      })
    },
  })
}

export const useCreateTrackerTopic = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<unknown>,
    Error,
    CreateTopicPayload
  >({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response =
        await api.post<ApiResponse<unknown>>(
          `/trackers/${trackerId}/topics`,
          payload
        )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useCreateTrackerSubtopic = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<unknown>,
    Error,
    CreateSubtopicPayload
  >({
    mutationFn: async ({
      trackerId,
      topicId,
      ...payload
    }) => {
      const response =
        await api.post<ApiResponse<unknown>>(
          `/trackers/${trackerId}/topics/${topicId}/subtopics`,
          payload
        )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useUpdateSubtopicProgress = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<unknown>,
    Error,
    UpdateSubtopicProgressPayload
  >({
    mutationFn: async ({
      trackerId,
      subtopicId,
      ...payload
    }) => {
      const response =
        await api.patch<ApiResponse<unknown>>(
          `/trackers/${trackerId}/subtopics/${subtopicId}/progress`,
          payload
        )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lesson(
          variables.trackerId,
          variables.subtopicId
        ),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useChatWithLessonTutor = () => {
  return useMutation<
    LessonChatResponse,
    Error,
    LessonChatPayload
  >({
    mutationFn: async ({
      trackerId,
      subtopicId,
      messages,
    }) => {
      const response =
        await api.post<LessonChatResponse>(
          `/trackers/${trackerId}/lessons/${subtopicId}/chat`,
          {
            messages,
          }
        )

      return response.data
    },
  })
}

export const useRunLessonCode = () => {
  return useMutation<
    RunLessonCodeResponse,
    Error,
    RunLessonCodePayload
  >({
    mutationFn: async ({
      trackerId,
      subtopicId,
      sourceCode,
      languageId,
      language,
      stdin,
    }) => {
      const response =
        await api.post<RunLessonCodeResponse>(
          `/trackers/${trackerId}/lessons/${subtopicId}/code/run`,
          {
            sourceCode,
            languageId,
            language,
            stdin,
          }
        )

      return response.data
    },
  })
}

export const useSubmitLessonCode = () => {
  return useMutation<
    SubmitLessonCodeResponse,
    Error,
    SubmitLessonCodePayload
  >({
    mutationFn: async ({
      trackerId,
      subtopicId,
      sourceCode,
      languageId,
      language,
      stdin,
    }) => {
      const response =
        await api.post<SubmitLessonCodeResponse>(
          `/trackers/${trackerId}/lessons/${subtopicId}/code/submit`,
          {
            sourceCode,
            languageId,
            language,
            stdin,
          }
        )

      return response.data
    },
  })
}

export const useGetCodeHint = () => {
  return useMutation<
    GetCodeHintResponse,
    Error,
    GetCodeHintPayload
  >({
    mutationFn: async ({
      trackerId,
      subtopicId,
      sourceCode,
      actualOutput,
      errorOutput,
      hintCount,
    }) => {
      const response =
        await api.post<GetCodeHintResponse>(
          `/trackers/${trackerId}/lessons/${subtopicId}/code/hint`,
          {
            sourceCode,
            actualOutput,
            errorOutput,
            hintCount,
          }
        )

      return response.data
    },
  })
}

export const useGetOptimizedSolution = () => {
  return useMutation<
    GetOptimizedSolutionResponse,
    Error,
    GetOptimizedSolutionPayload
  >({
    mutationFn: async ({
      trackerId,
      subtopicId,
      sourceCode,
      language,
    }) => {
      const response =
        await api.post<GetOptimizedSolutionResponse>(
          `/trackers/${trackerId}/lessons/${subtopicId}/code/optimized-solution`,
          {
            sourceCode,
            language,
          }
        )

      return response.data
    },
  })
}

export const useVerifyLessonAnswer = () => {
  return useMutation<
    VerifyLessonAnswerResponse,
    Error,
    VerifyLessonAnswerPayload
  >({
    mutationFn: async ({
      trackerId,
      subtopicId,
      question,
      answer,
    }) => {
      const response =
        await api.post<VerifyLessonAnswerResponse>(
          `/trackers/${trackerId}/lessons/${subtopicId}/answer/verify`,
          {
            question,
            answer,
          }
        )

      return response.data
    },
  })
}

export const useAddMissingEvaluationTopic = () => {
  const queryClient = useQueryClient()

  return useMutation<
    AddMissingEvaluationTopicResponse,
    Error,
    AddMissingEvaluationTopicPayload
  >({
    mutationFn: async ({
      trackerId,
      evaluationJobId,
      topicIndex,
    }) => {
      const response =
        await api.post<AddMissingEvaluationTopicResponse>(
          `/trackers/${trackerId}/evaluation-jobs/${evaluationJobId}/missing-topics/${topicIndex}/add`
        )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'roadmap-evaluation-result',
          variables.evaluationJobId,
        ],
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })
    },
  })
}