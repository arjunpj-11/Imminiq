import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import api from '../../../lib/axios'

import type {
  ApiResponse,
  AttemptAnalysis,
  AttemptResultResponse,
  CreateMockTestPayload,
  GenerateMockTestPayload,
  ImportSharedMockTestResponse,
  ListMockTestsResponse,
  MockTest,
  MockTestAnswer,
  MockTestDetailsResponse,
  MockTestQuestion,
  MockTestShareResponse,
  StartAttemptResponse,
  SubmitAnswerPayload,
  TestAnalytics,
} from '../types/mock-tests.types'

export const mockTestKeys = {
  all: ['mock-tests'] as const,

  lists: () => [...mockTestKeys.all, 'list'] as const,

  list: (page = 1, limit = 6) =>
    [...mockTestKeys.lists(), { page, limit }] as const,

  details: () => [...mockTestKeys.all, 'detail'] as const,

  detail: (testId: string) => [...mockTestKeys.details(), testId] as const,

  share: (testId: string) =>
    [...mockTestKeys.detail(testId), 'share'] as const,

  sharedImport: (shareToken: string) =>
    [...mockTestKeys.all, 'shared-import', shareToken] as const,

  history: () => [...mockTestKeys.all, 'history'] as const,

  analytics: () => [...mockTestKeys.all, 'analytics'] as const,

  analyticsTrends: () => [...mockTestKeys.analytics(), 'trends'] as const,

  aiInsights: () => [...mockTestKeys.analytics(), 'ai-insights'] as const,

  topicBreakdown: () =>
    [...mockTestKeys.analytics(), 'topic-breakdown'] as const,

  attempts: () => [...mockTestKeys.all, 'attempts'] as const,

  attempt: (attemptId: string) =>
    [...mockTestKeys.attempts(), attemptId] as const,

  attemptQuestions: (attemptId: string) =>
    [...mockTestKeys.attempt(attemptId), 'questions'] as const,

  attemptResult: (attemptId: string) =>
    [...mockTestKeys.attempt(attemptId), 'result'] as const,

  attemptAnalysis: (attemptId: string) =>
    [...mockTestKeys.attempt(attemptId), 'analysis'] as const,
}

const unwrap = <T>(response: ApiResponse<T>) => {
  return response.data
}

// ─── Tests ───────────────────────────────────────────────────────────────────

export const useMockTests = (page = 1, limit = 6) => {
  return useQuery({
    queryKey: mockTestKeys.list(page, limit),

    queryFn: async () => {
      const response = await api.get<ApiResponse<ListMockTestsResponse>>(
        '/mock-tests',
        {
          params: {
            page,
            limit,
          },
        }
      )

      return unwrap(response.data)
    },

    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export const useMockTestDetails = (testId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.detail(testId || ''),
    enabled: Boolean(testId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<MockTestDetailsResponse>>(
        `/mock-tests/${testId}`
      )

      return unwrap(response.data)
    },
  })
}

export const useCreateMockTest = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<MockTest>, Error, CreateMockTestPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<ApiResponse<MockTest>>(
        '/mock-tests',
        payload
      )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      })
    },
  })
}

export const useGenerateMockTest = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<MockTest>, Error, GenerateMockTestPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<ApiResponse<MockTest>>(
        '/mock-tests/generate',
        payload
      )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      })
    },
  })
}

export const useShareMockTest = () => {
  return useMutation<ApiResponse<MockTestShareResponse>, Error, string>({
    mutationFn: async (testId) => {
      const response = await api.post<ApiResponse<MockTestShareResponse>>(
        `/mock-tests/${testId}/share`
      )

      return response.data
    },
  })
}

export const useImportSharedMockTest = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<ImportSharedMockTestResponse>, Error, string>({
    mutationFn: async (shareToken) => {
      const response = await api.post<
        ApiResponse<ImportSharedMockTestResponse>
      >(`/mock-tests/shared/${shareToken}/import`)

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      })
    },
  })
}

// ─── Attempts ────────────────────────────────────────────────────────────────

export const useStartMockTestAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<StartAttemptResponse>, Error, string>({
    mutationFn: async (testId) => {
      const response = await api.post<ApiResponse<StartAttemptResponse>>(
        `/mock-tests/${testId}/start`
      )

      return response.data
    },

    onSuccess: (_response, testId) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.detail(testId),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.history(),
      })
    },
  })
}

export const useMockTestAttemptQuestions = (attemptId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.attemptQuestions(attemptId || ''),
    enabled: Boolean(attemptId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<MockTestQuestion[]>>(
        `/mock-tests/attempts/${attemptId}/questions`
      )

      return unwrap(response.data)
    },
  })
}

export const useSubmitMockTestAnswer = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<MockTestAnswer>,
    Error,
    {
      attemptId: string
      payload: SubmitAnswerPayload
    }
  >({
    mutationFn: async ({ attemptId, payload }) => {
      const response = await api.post<ApiResponse<MockTestAnswer>>(
        `/mock-tests/attempts/${attemptId}/answers`,
        payload
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptQuestions(variables.attemptId),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attempt(variables.attemptId),
      })
    },
  })
}

export const useFlagMockTestQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<{ flagged: boolean }>,
    Error,
    {
      attemptId: string
      questionId: string
    }
  >({
    mutationFn: async ({ attemptId, questionId }) => {
      const response = await api.post<ApiResponse<{ flagged: boolean }>>(
        `/mock-tests/attempts/${attemptId}/flag`,
        {
          questionId,
        }
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptQuestions(variables.attemptId),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attempt(variables.attemptId),
      })
    },
  })
}

export const useFinishMockTestAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<unknown>,
    Error,
    {
      attemptId: string
    }
  >({
    mutationFn: async ({ attemptId }) => {
      const response = await api.post<ApiResponse<unknown>>(
        `/mock-tests/attempts/${attemptId}/finish`
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptResult(variables.attemptId),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptAnalysis(variables.attemptId),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.history(),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.analytics(),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      })
    },
  })
}

export const useMockTestAttemptResult = (attemptId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.attemptResult(attemptId || ''),
    enabled: Boolean(attemptId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<AttemptResultResponse>>(
        `/mock-tests/attempts/${attemptId}/result`
      )

      return unwrap(response.data)
    },
  })
}

export const useMockTestAttemptAnalysis = (attemptId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.attemptAnalysis(attemptId || ''),
    enabled: Boolean(attemptId),

    queryFn: async () => {
      const response = await api.get<ApiResponse<AttemptAnalysis>>(
        `/mock-tests/attempts/${attemptId}/analysis`
      )

      return unwrap(response.data)
    },
  })
}

export const useRetakeMockTest = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<StartAttemptResponse>, Error, string>({
    mutationFn: async (attemptId) => {
      const response = await api.post<ApiResponse<StartAttemptResponse>>(
        `/mock-tests/attempts/${attemptId}/retake`
      )

      return response.data
    },

    onSuccess: (_response, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attempt(attemptId),
      })

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.history(),
      })
    },
  })
}

// ─── History + Analytics ─────────────────────────────────────────────────────

export const useMockTestHistory = () => {
  return useQuery({
    queryKey: mockTestKeys.history(),

    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(
        '/mock-tests/history'
      )

      return unwrap(response.data)
    },

    staleTime: 30_000,
  })
}

export const useMockTestAnalytics = () => {
  return useQuery({
    queryKey: mockTestKeys.analytics(),

    queryFn: async () => {
      const response = await api.get<ApiResponse<TestAnalytics>>(
        '/mock-tests/analytics/trends'
      )

      return unwrap(response.data)
    },

    staleTime: 30_000,
  })
}

export const useMockTestAIInsights = () => {
  return useQuery({
    queryKey: mockTestKeys.aiInsights(),

    queryFn: async () => {
      const response = await api.get<ApiResponse<{ insight: string }>>(
        '/mock-tests/analytics/ai-insights'
      )

      return unwrap(response.data)
    },

    staleTime: 60_000,
  })
}

export const useMockTestTopicBreakdown = () => {
  return useQuery({
    queryKey: mockTestKeys.topicBreakdown(),

    queryFn: async () => {
      const response = await api.get<
        ApiResponse<
          {
            topic: string
            averageScore: number
            totalAttempts: number
          }[]
        >
      >('/mock-tests/analytics/topic-breakdown')

      return unwrap(response.data)
    },

    staleTime: 60_000,
  })
}