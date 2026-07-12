import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'

interface IGenerateAiAvatarPreviewPayload {
  prompt: string
}

interface IGenerateAiAvatarPreviewResponse {
  success: boolean
  message: string
  data?: {
    imageUrl: string
  }
}

interface IApiErrorResponse {
  success?: boolean
  message?: string
  code?: string
}

export const useGenerateAiAvatarPreview = () => {
  return useMutation<
    IGenerateAiAvatarPreviewResponse,
    AxiosError<IApiErrorResponse>,
    IGenerateAiAvatarPreviewPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<IGenerateAiAvatarPreviewResponse>(
          '/uploads/avatar/ai-preview',
          payload
        )

      return response.data
    },
  })
}