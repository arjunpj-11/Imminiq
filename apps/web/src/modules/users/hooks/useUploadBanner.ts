import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  ProfileImageUploadResponse,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

export const useUploadBanner = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<ProfileImageUploadResponse>,
    AxiosError<ApiErrorResponse>,
    File
  >({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<
        ApiResponse<ProfileImageUploadResponse>
      >('/uploads/banner', formData)

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      })
    },
  })
}
