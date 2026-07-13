import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../../../lib/axios'

interface IGenerateAiBannerPreviewPayload {
  prompt: string
}

interface IGenerateAiBannerPreviewResponse {
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

export const useGenerateAiBannerPreview = () => {
  return useMutation<
    IGenerateAiBannerPreviewResponse,
    AxiosError<IApiErrorResponse>,
    IGenerateAiBannerPreviewPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<IGenerateAiBannerPreviewResponse>(
          '/uploads/banner/ai-preview',
          payload
        )

      return response.data
    },
  })
}