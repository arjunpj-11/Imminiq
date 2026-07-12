import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import api from '../../../lib/axios'

import type {
  IApiResponse,
  IAttemptAnalysis,
  IAttemptResultResponse,
  ICreateMockTestPayload,
  IGenerateMockTestPayload,
  IImportSharedMockTestResponse,
  IListMockTestsResponse,
  IMockTest,
  IMockTestAnswer,
  IMockTestCodeRunResponse,
  IMockTestCodeSubmitResponse,
  IMockTestDetailsResponse,
  IMockTestQuestion,
  IMockTestShareResponse,
  IRunMockTestCodePayload,
  IStartAttemptResponse,
  ISubmitAnswerPayload,
  ISubmitMockTestCodePayload,
  ITestAnalytics,
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

const unwrap = <T>(response: IApiResponse<T>) => {
  return response.data
}

// ─── Tests ───────────────────────────────────────────────────────────────────

export const useMockTests = (page = 1, limit = 6) => {
  return useQuery({
    queryKey: mockTestKeys.list(page, limit),

    queryFn: async () => {
      const response = await api.get<IApiResponse<IListMockTestsResponse>>(
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
      const response = await api.get<IApiResponse<IMockTestDetailsResponse>>(
        `/mock-tests/${testId}`
      )

      return unwrap(response.data)
    },
  })
}

export const useCreateMockTest = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<IMockTest>, Error, ICreateMockTestPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<IApiResponse<IMockTest>>(
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

  return useMutation<IApiResponse<IMockTest>, Error, IGenerateMockTestPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<IApiResponse<IMockTest>>(
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
  return useMutation<IApiResponse<IMockTestShareResponse>, Error, string>({
    mutationFn: async (testId) => {
      const response = await api.post<IApiResponse<IMockTestShareResponse>>(
        `/mock-tests/${testId}/share`
      )

      return response.data
    },
  })
}

export const useImportSharedMockTest = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<IImportSharedMockTestResponse>, Error, string>({
    mutationFn: async (shareToken) => {
      const response = await api.post<
        IApiResponse<IImportSharedMockTestResponse>
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

  return useMutation<IApiResponse<IStartAttemptResponse>, Error, string>({
    mutationFn: async (testId) => {
      const response = await api.post<IApiResponse<IStartAttemptResponse>>(
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
      const response = await api.get<IApiResponse<IMockTestQuestion[]>>(
        `/mock-tests/attempts/${attemptId}/questions`
      )

      return unwrap(response.data)
    },
  })
}

export const useSubmitMockTestAnswer = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<IMockTestAnswer>,
    Error,
    {
      attemptId: string
      payload: ISubmitAnswerPayload
    }
  >({
    mutationFn: async ({ attemptId, payload }) => {
      const response = await api.post<IApiResponse<IMockTestAnswer>>(
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
    IApiResponse<{ flagged: boolean }>,
    Error,
    {
      attemptId: string
      questionId: string
    }
  >({
    mutationFn: async ({ attemptId, questionId }) => {
      const response = await api.post<IApiResponse<{ flagged: boolean }>>(
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
    IApiResponse<unknown>,
    Error,
    {
      attemptId: string
    }
  >({
    mutationFn: async ({ attemptId }) => {
      const response = await api.post<IApiResponse<unknown>>(
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

export const useRunMockTestCode = () => {
  return useMutation<
    IApiResponse<IMockTestCodeRunResponse>,
    Error,
    {
      attemptId: string
      questionId: string
      payload: IRunMockTestCodePayload
    }
  >({
    mutationFn: async ({ attemptId, questionId, payload }) => {
      const response = await api.post<IApiResponse<IMockTestCodeRunResponse>>(
        `/mock-tests/attempts/${attemptId}/questions/${questionId}/run-code`,
        payload
      )

      return response.data
    },
  })
}

export const useSubmitMockTestCode = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<IMockTestCodeSubmitResponse>,
    Error,
    {
      attemptId: string
      questionId: string
      payload: ISubmitMockTestCodePayload
    }
  >({
    mutationFn: async ({ attemptId, questionId, payload }) => {
      const response = await api.post<IApiResponse<IMockTestCodeSubmitResponse>>(
        `/mock-tests/attempts/${attemptId}/questions/${questionId}/submit-code`,
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

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptResult(variables.attemptId),
      })
    },
  })
}

export const useMockTestAttemptResult = (attemptId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.attemptResult(attemptId || ''),
    enabled: Boolean(attemptId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<IAttemptResultResponse>>(
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
      const response = await api.get<IApiResponse<IAttemptAnalysis>>(
        `/mock-tests/attempts/${attemptId}/analysis`
      )

      return unwrap(response.data)
    },
  })
}

export const useRetakeMockTest = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<IStartAttemptResponse>, Error, string>({
    mutationFn: async (attemptId) => {
      const response = await api.post<IApiResponse<IStartAttemptResponse>>(
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
      const response = await api.get<IApiResponse<unknown>>(
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
      const response = await api.get<IApiResponse<ITestAnalytics>>(
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
      const response = await api.get<IApiResponse<{ insight: string }>>(
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
        IApiResponse<
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