import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import type {
  IApiErrorResponse,
  IApiResponse,
  IProfileImageUploadResponse,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

export const useUploadBanner = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<IProfileImageUploadResponse>,
    AxiosError<IApiErrorResponse>,
    File
  >({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<
        IApiResponse<IProfileImageUploadResponse>
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
