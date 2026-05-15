import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  GetMyProfileResponse,
  UpdateProfilePayload,
} from '../../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<GetMyProfileResponse>,
    AxiosError<ApiErrorResponse>,
    UpdateProfilePayload
  >({
    mutationFn: async (payload) => {
      const response = await api.patch<ApiResponse<GetMyProfileResponse>>(
        '/users/me',
        payload
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      })

      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.stats(),
      })
    },
  })
}
