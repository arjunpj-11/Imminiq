import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_API_PATHS } from '../constants/tracker-api.constants';
import type {
  IApiResponse,
  AskLessonQuestionSolutionDoubtPayload,
  AskLessonQuestionSolutionDoubtResponse,
  GenerateLessonQuestionSolutionPayload,
  GenerateLessonQuestionSolutionResponse,
  GenerateLessonQuestionsPayload,
  GenerateLessonQuestionsResponse,
  GenerateLessonVisualizationPayload,
  GenerateLessonVisualizationResponse,
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
  VerifyLessonAnswerPayload,
  VerifyLessonAnswerResponse,
} from '../types/tracker.types';
import { trackerKeys } from './trackers.query-keys';

export const useChatWithLessonTutor = () => {
  const queryClient = useQueryClient();

  return useMutation<LessonChatResponse, Error, LessonChatPayload>({
    mutationFn: async ({ trackerId, subtopicId, messages }) => {
      const response = await api.post<LessonChatResponse>(
        TRACKER_API_PATHS.lessonChat(trackerId, subtopicId),
        {
          messages,
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonChat(variables.trackerId, variables.subtopicId),
      });
    },
  });
};

export const useGenerateLessonQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<GenerateLessonQuestionsResponse, Error, GenerateLessonQuestionsPayload>({
    mutationFn: async ({ trackerId, subtopicId, count }) => {
      const response = await api.post<GenerateLessonQuestionsResponse>(
        TRACKER_API_PATHS.generateLessonQuestions(trackerId, subtopicId),
        {
          count,
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonGeneratedQuestions(variables.trackerId, variables.subtopicId),
      });
    },
  });
};

export const useGenerateLessonQuestionSolution = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GenerateLessonQuestionSolutionResponse,
    Error,
    GenerateLessonQuestionSolutionPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, question }) => {
      const response = await api.post<GenerateLessonQuestionSolutionResponse>(
        TRACKER_API_PATHS.generateLessonQuestionSolution(trackerId, subtopicId),
        {
          question,
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonQuestionSolution(
          variables.trackerId,
          variables.subtopicId,
          variables.question
        ),
      });
    },
  });
};

export const useAskLessonQuestionSolutionDoubt = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AskLessonQuestionSolutionDoubtResponse,
    Error,
    AskLessonQuestionSolutionDoubtPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, question, message }) => {
      const response = await api.post<AskLessonQuestionSolutionDoubtResponse>(
        TRACKER_API_PATHS.lessonQuestionSolutionDoubts(trackerId, subtopicId),
        {
          question,
          message,
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonQuestionSolutionDoubts(
          variables.trackerId,
          variables.subtopicId,
          variables.question
        ),
      });
    },
  });
};

export const useRunLessonCode = () => {
  return useMutation<RunLessonCodeResponse, Error, RunLessonCodePayload>({
    mutationFn: async ({ trackerId, subtopicId, sourceCode, languageId, language, stdin }) => {
      const response = await api.post<RunLessonCodeResponse>(
        TRACKER_API_PATHS.runLessonCode(trackerId, subtopicId),
        {
          sourceCode,
          languageId,
          language,
          stdin,
        }
      );

      return response.data;
    },
  });
};

export const useSubmitLessonCode = () => {
  const queryClient = useQueryClient();

  return useMutation<SubmitLessonCodeResponse, Error, SubmitLessonCodePayload>({
    mutationFn: async ({ trackerId, subtopicId, sourceCode, languageId, language, stdin }) => {
      const response = await api.post<SubmitLessonCodeResponse>(
        TRACKER_API_PATHS.submitLessonCode(trackerId, subtopicId),
        {
          sourceCode,
          languageId,
          language,
          stdin,
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonCodeSubmissions(variables.trackerId, variables.subtopicId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonCodeSubmissions(
          variables.trackerId,
          variables.subtopicId,
          'submit'
        ),
      });
    },
  });
};

export const useGetCodeHint = () => {
  return useMutation<GetCodeHintResponse, Error, GetCodeHintPayload>({
    mutationFn: async ({
      trackerId,
      subtopicId,
      sourceCode,
      actualOutput,
      errorOutput,
      hintCount,
    }) => {
      const response = await api.post<GetCodeHintResponse>(
        TRACKER_API_PATHS.lessonCodeHint(trackerId, subtopicId),
        {
          sourceCode,
          actualOutput,
          errorOutput,
          hintCount,
        }
      );

      return response.data;
    },
  });
};

export const useGetOptimizedSolution = () => {
  return useMutation<GetOptimizedSolutionResponse, Error, GetOptimizedSolutionPayload>({
    mutationFn: async ({ trackerId, subtopicId, sourceCode, language }) => {
      const response = await api.post<GetOptimizedSolutionResponse>(
        TRACKER_API_PATHS.optimizedLessonSolution(trackerId, subtopicId),
        {
          sourceCode,
          language,
        }
      );

      return response.data;
    },
  });
};

export const useVerifyLessonAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<VerifyLessonAnswerResponse, Error, VerifyLessonAnswerPayload>({
    mutationFn: async ({ trackerId, subtopicId, question, answer }) => {
      const response = await api.post<VerifyLessonAnswerResponse>(
        TRACKER_API_PATHS.verifyLessonAnswer(trackerId, subtopicId),
        {
          question,
          answer,
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonAnswerAttempts(variables.trackerId, variables.subtopicId),
      });
    },
  });
};

export const useClearLessonChatHistory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<unknown>,
    Error,
    {
      trackerId: string;
      subtopicId: string;
    }
  >({
    mutationFn: async ({ trackerId, subtopicId }) => {
      const response = await api.delete<IApiResponse<unknown>>(
        TRACKER_API_PATHS.lessonChat(trackerId, subtopicId)
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonChat(variables.trackerId, variables.subtopicId),
      });
    },
  });
};

export const useClearLessonQuestionSolutionDoubts = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<unknown>,
    Error,
    {
      trackerId: string;
      subtopicId: string;
      question: string;
    }
  >({
    mutationFn: async ({ trackerId, subtopicId, question }) => {
      const response = await api.delete<IApiResponse<unknown>>(
        TRACKER_API_PATHS.lessonQuestionSolutionDoubts(trackerId, subtopicId),
        {
          params: {
            question,
          },
        }
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonQuestionSolutionDoubts(
          variables.trackerId,
          variables.subtopicId,
          variables.question
        ),
      });
    },
  });
};

export const useGenerateLessonVisualization = () => {
  return useMutation<
    GenerateLessonVisualizationResponse,
    Error,
    GenerateLessonVisualizationPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, regenerate }) => {
      const response = await api.post<GenerateLessonVisualizationResponse>(
        TRACKER_API_PATHS.lessonVisualization(trackerId, subtopicId),
        {},
        { params: regenerate ? { regenerate: 'true' } : undefined }
      );
      return response.data;
    },
  });
};
