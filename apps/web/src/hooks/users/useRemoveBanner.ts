import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  RemoveBannerResponse,
} from '../../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

export const useRemoveBanner = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<RemoveBannerResponse>,
    AxiosError<ApiErrorResponse>,
    void
  >({
    mutationFn: async () => {
      const response = await api.delete<ApiResponse<RemoveBannerResponse>>(
        '/uploads/banner'
      )

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      })
    },
  })
}
