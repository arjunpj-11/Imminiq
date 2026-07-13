import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from '../../../../lib/axios'
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
} from '../types/tracker.types'
import { trackerKeys } from './tracker.keys'

export const useChatWithLessonTutor = () => {
  const queryClient = useQueryClient()

  return useMutation<LessonChatResponse, Error, LessonChatPayload>({
    mutationFn: async ({ trackerId, subtopicId, messages }) => {
      const response = await api.post<LessonChatResponse>(
        `/trackers/${trackerId}/lessons/${subtopicId}/chat`,
        {
          messages,
        }
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonChat(
          variables.trackerId,
          variables.subtopicId
        ),
      })
    },
  })
}

export const useGenerateLessonQuestions = () => {
  const queryClient = useQueryClient()

  return useMutation<
    GenerateLessonQuestionsResponse,
    Error,
    GenerateLessonQuestionsPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, count }) => {
      const response = await api.post<GenerateLessonQuestionsResponse>(
        `/trackers/${trackerId}/lessons/${subtopicId}/questions/generate`,
        {
          count,
        }
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonGeneratedQuestions(
          variables.trackerId,
          variables.subtopicId
        ),
      })
    },
  })
}

export const useGenerateLessonQuestionSolution = () => {
  const queryClient = useQueryClient()

  return useMutation<
    GenerateLessonQuestionSolutionResponse,
    Error,
    GenerateLessonQuestionSolutionPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, question }) => {
      const response =
        await api.post<GenerateLessonQuestionSolutionResponse>(
          `/trackers/${trackerId}/lessons/${subtopicId}/question-solution/generate`,
          {
            question,
          }
        )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonQuestionSolution(
          variables.trackerId,
          variables.subtopicId,
          variables.question
        ),
      })
    },
  })
}

export const useAskLessonQuestionSolutionDoubt = () => {
  const queryClient = useQueryClient()

  return useMutation<
    AskLessonQuestionSolutionDoubtResponse,
    Error,
    AskLessonQuestionSolutionDoubtPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, question, message }) => {
      const response = await api.post<AskLessonQuestionSolutionDoubtResponse>(
        `/trackers/${trackerId}/lessons/${subtopicId}/question-solution/doubts`,
        {
          question,
          message,
        }
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonQuestionSolutionDoubts(
          variables.trackerId,
          variables.subtopicId,
          variables.question
        ),
      })
    },
  })
}

export const useRunLessonCode = () => {
  return useMutation<RunLessonCodeResponse, Error, RunLessonCodePayload>({
    mutationFn: async ({
      trackerId,
      subtopicId,
      sourceCode,
      languageId,
      language,
      stdin,
    }) => {
      const response = await api.post<RunLessonCodeResponse>(
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
  const queryClient = useQueryClient()

  return useMutation<SubmitLessonCodeResponse, Error, SubmitLessonCodePayload>({
    mutationFn: async ({
      trackerId,
      subtopicId,
      sourceCode,
      languageId,
      language,
      stdin,
    }) => {
      const response = await api.post<SubmitLessonCodeResponse>(
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

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonCodeSubmissions(
          variables.trackerId,
          variables.subtopicId
        ),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonCodeSubmissions(
          variables.trackerId,
          variables.subtopicId,
          'submit'
        ),
      })
    },
  })
}

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
    mutationFn: async ({ trackerId, subtopicId, sourceCode, language }) => {
      const response = await api.post<GetOptimizedSolutionResponse>(
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
  const queryClient = useQueryClient()

  return useMutation<
    VerifyLessonAnswerResponse,
    Error,
    VerifyLessonAnswerPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, question, answer }) => {
      const response = await api.post<VerifyLessonAnswerResponse>(
        `/trackers/${trackerId}/lessons/${subtopicId}/answer/verify`,
        {
          question,
          answer,
        }
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonAnswerAttempts(
          variables.trackerId,
          variables.subtopicId
        ),
      })
    },
  })
}

export const useClearLessonChatHistory = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<unknown>,
    Error,
    {
      trackerId: string
      subtopicId: string
    }
  >({
    mutationFn: async ({ trackerId, subtopicId }) => {
      const response = await api.delete<IApiResponse<unknown>>(
        `/trackers/${trackerId}/lessons/${subtopicId}/chat`
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonChat(
          variables.trackerId,
          variables.subtopicId
        ),
      })
    },
  })
}

export const useClearLessonQuestionSolutionDoubts = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<unknown>,
    Error,
    {
      trackerId: string
      subtopicId: string
      question: string
    }
  >({
    mutationFn: async ({ trackerId, subtopicId, question }) => {
      const response = await api.delete<IApiResponse<unknown>>(
        `/trackers/${trackerId}/lessons/${subtopicId}/question-solution/doubts`,
        {
          params: {
            question,
          },
        }
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.lessonQuestionSolutionDoubts(
          variables.trackerId,
          variables.subtopicId,
          variables.question
        ),
      })
    },
  })
}

export const useGenerateLessonVisualization = () => {
  return useMutation<
    GenerateLessonVisualizationResponse,
    Error,
    GenerateLessonVisualizationPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, regenerate }) => {
      const response = await api.post<GenerateLessonVisualizationResponse>(
        `/trackers/${trackerId}/lessons/${subtopicId}/visualize`,
        {},
        { params: regenerate ? { regenerate: 'true' } : undefined }
      )
      return response.data
    },
    
  })
}
 
 

