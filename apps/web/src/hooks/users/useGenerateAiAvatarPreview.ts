import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'

interface GenerateAiAvatarPreviewPayload {
  prompt: string
}

interface GenerateAiAvatarPreviewResponse {
  success: boolean
  message: string
  data?: {
    imageUrl: string
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
  code?: string
}

export const useGenerateAiAvatarPreview = () => {
  return useMutation<
    GenerateAiAvatarPreviewResponse,
    AxiosError<ApiErrorResponse>,
    GenerateAiAvatarPreviewPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<GenerateAiAvatarPreviewResponse>(
          '/uploads/avatar/ai-preview',
          payload
        )

      return response.data
    },
  })
}