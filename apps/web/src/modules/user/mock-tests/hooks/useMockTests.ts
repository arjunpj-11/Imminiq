import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { MOCK_TEST_API_PATHS } from '../constants/mock-tests.constants';
import { mockTestKeys } from './mock-tests.query-keys';

import type {
  IApiResponse,
  IAttemptAnalysis,
  IAttemptResultResponse,
  ICreateMockTestPayload,
  IGenerateMockTestPayload,
  IImportSharedMockTestResponse,
  IListMockTestsResponse,
  IMockTest,
  IMockTestGenerationJob,
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
} from '../types/mock-tests.types';

const unwrap = <T>(response: IApiResponse<T>) => {
  return response.data;
};

// ─── Tests ───────────────────────────────────────────────────────────────────

export const useMockTests = (page = 1, limit = 6) => {
  return useQuery({
    queryKey: mockTestKeys.list(page, limit),

    queryFn: async () => {
      const response = await api.get<IApiResponse<IListMockTestsResponse>>(MOCK_TEST_API_PATHS.root, {
        params: {
          page,
          limit,
        },
      });

      return unwrap(response.data);
    },

    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useMockTestDetails = (testId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.detail(testId || ''),
    enabled: Boolean(testId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<IMockTestDetailsResponse>>(
        MOCK_TEST_API_PATHS.detail(testId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useCreateMockTest = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<IMockTest>, Error, ICreateMockTestPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<IApiResponse<IMockTest>>(MOCK_TEST_API_PATHS.root, payload);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      });
    },
  });
};

export const useGenerateMockTest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<IMockTest | IMockTestGenerationJob>,
    Error,
    IGenerateMockTestPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<IApiResponse<IMockTest | IMockTestGenerationJob>>(
        MOCK_TEST_API_PATHS.generate,
        payload
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      });
    },
  });
};

export const useActiveMockTestGeneration = () => {
  return useQuery({
    queryKey: mockTestKeys.activeGeneration(),
    queryFn: async () => {
      const response = await api.get<
        IApiResponse<{
          jobId: string;
          status: 'pending' | 'processing';
        } | null>
      >(MOCK_TEST_API_PATHS.activeGeneration);

      return unwrap(response.data);
    },
    refetchInterval: 1500,
    refetchOnWindowFocus: true,
  });
};

export const useShareMockTest = () => {
  return useMutation<IApiResponse<IMockTestShareResponse>, Error, string>({
    mutationFn: async (testId) => {
      const response = await api.post<IApiResponse<IMockTestShareResponse>>(
        MOCK_TEST_API_PATHS.share(testId)
      );

      return response.data;
    },
  });
};

export const useImportSharedMockTest = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<IImportSharedMockTestResponse>, Error, string>({
    mutationFn: async (shareToken) => {
      const response = await api.post<IApiResponse<IImportSharedMockTestResponse>>(
        MOCK_TEST_API_PATHS.importShared(shareToken)
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      });
    },
  });
};

// ─── Attempts ────────────────────────────────────────────────────────────────

export const useStartMockTestAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<IStartAttemptResponse>, Error, string>({
    mutationFn: async (testId) => {
      const response = await api.post<IApiResponse<IStartAttemptResponse>>(
        MOCK_TEST_API_PATHS.start(testId)
      );

      return response.data;
    },

    onSuccess: (_response, testId) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.detail(testId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.history(),
      });
    },
  });
};

export const useMockTestAttemptQuestions = (attemptId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.attemptQuestions(attemptId || ''),
    enabled: Boolean(attemptId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<IMockTestQuestion[]>>(
        MOCK_TEST_API_PATHS.attemptQuestions(attemptId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useSubmitMockTestAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<IMockTestAnswer>,
    Error,
    {
      attemptId: string;
      payload: ISubmitAnswerPayload;
    }
  >({
    mutationFn: async ({ attemptId, payload }) => {
      const response = await api.post<IApiResponse<IMockTestAnswer>>(
        MOCK_TEST_API_PATHS.submitAnswer(attemptId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptQuestions(variables.attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attempt(variables.attemptId),
      });
    },
  });
};

export const useFlagMockTestQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<{ flagged: boolean }>,
    Error,
    {
      attemptId: string;
      questionId: string;
    }
  >({
    mutationFn: async ({ attemptId, questionId }) => {
      const response = await api.post<IApiResponse<{ flagged: boolean }>>(
        MOCK_TEST_API_PATHS.flagQuestion(attemptId),
        {
          questionId,
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptQuestions(variables.attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attempt(variables.attemptId),
      });
    },
  });
};

export const useFinishMockTestAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<unknown>,
    Error,
    {
      attemptId: string;
    }
  >({
    mutationFn: async ({ attemptId }) => {
      const response = await api.post<IApiResponse<unknown>>(
        MOCK_TEST_API_PATHS.finishAttempt(attemptId)
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptResult(variables.attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptAnalysis(variables.attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.history(),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.analytics(),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.all,
      });
    },
  });
};

export const useRunMockTestCode = () => {
  return useMutation<
    IApiResponse<IMockTestCodeRunResponse>,
    Error,
    {
      attemptId: string;
      questionId: string;
      payload: IRunMockTestCodePayload;
    }
  >({
    mutationFn: async ({ attemptId, questionId, payload }) => {
      const response = await api.post<IApiResponse<IMockTestCodeRunResponse>>(
        MOCK_TEST_API_PATHS.runCode(attemptId, questionId),
        payload
      );

      return response.data;
    },
  });
};

export const useSubmitMockTestCode = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<IMockTestCodeSubmitResponse>,
    Error,
    {
      attemptId: string;
      questionId: string;
      payload: ISubmitMockTestCodePayload;
    }
  >({
    mutationFn: async ({ attemptId, questionId, payload }) => {
      const response = await api.post<IApiResponse<IMockTestCodeSubmitResponse>>(
        MOCK_TEST_API_PATHS.submitCode(attemptId, questionId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptQuestions(variables.attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attempt(variables.attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attemptResult(variables.attemptId),
      });
    },
  });
};

export const useMockTestAttemptResult = (attemptId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.attemptResult(attemptId || ''),
    enabled: Boolean(attemptId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<IAttemptResultResponse>>(
        MOCK_TEST_API_PATHS.attemptResult(attemptId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useMockTestAttemptAnalysis = (attemptId?: string) => {
  return useQuery({
    queryKey: mockTestKeys.attemptAnalysis(attemptId || ''),
    enabled: Boolean(attemptId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<IAttemptAnalysis>>(
        MOCK_TEST_API_PATHS.attemptAnalysis(attemptId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useRetakeMockTest = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<IStartAttemptResponse>, Error, string>({
    mutationFn: async (attemptId) => {
      const response = await api.post<IApiResponse<IStartAttemptResponse>>(
        MOCK_TEST_API_PATHS.retakeAttempt(attemptId)
      );

      return response.data;
    },

    onSuccess: (_response, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: mockTestKeys.attempt(attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: mockTestKeys.history(),
      });
    },
  });
};

// ─── History + Analytics ─────────────────────────────────────────────────────

export const useMockTestHistory = () => {
  return useQuery({
    queryKey: mockTestKeys.history(),

    queryFn: async () => {
      const response = await api.get<IApiResponse<unknown>>(MOCK_TEST_API_PATHS.history);

      return unwrap(response.data);
    },

    staleTime: 30_000,
  });
};

export const useMockTestAnalytics = () => {
  return useQuery({
    queryKey: mockTestKeys.analytics(),

    queryFn: async () => {
      const response = await api.get<IApiResponse<ITestAnalytics>>(
        MOCK_TEST_API_PATHS.analyticsTrends
      );

      return unwrap(response.data);
    },

    staleTime: 30_000,
  });
};

export const useMockTestAIInsights = () => {
  return useQuery({
    queryKey: mockTestKeys.aiInsights(),

    queryFn: async () => {
      const response = await api.get<IApiResponse<{ insight: string }>>(
        MOCK_TEST_API_PATHS.analyticsAiInsights
      );

      return unwrap(response.data);
    },

    staleTime: 60_000,
  });
};

export const useMockTestTopicBreakdown = () => {
  return useQuery({
    queryKey: mockTestKeys.topicBreakdown(),

    queryFn: async () => {
      const response = await api.get<
        IApiResponse<
          {
            topic: string;
            averageScore: number;
            totalAttempts: number;
          }[]
        >
      >(MOCK_TEST_API_PATHS.analyticsTopicBreakdown);

      return unwrap(response.data);
    },

    staleTime: 60_000,
  });
};
