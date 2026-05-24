import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'

interface GenerateAiBannerPreviewPayload {
  prompt: string
}

interface GenerateAiBannerPreviewResponse {
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

export const useGenerateAiBannerPreview = () => {
  return useMutation<
    GenerateAiBannerPreviewResponse,
    AxiosError<ApiErrorResponse>,
    GenerateAiBannerPreviewPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<GenerateAiBannerPreviewResponse>(
          '/uploads/banner/ai-preview',
          payload
        )

      return response.data
    },
  })
}