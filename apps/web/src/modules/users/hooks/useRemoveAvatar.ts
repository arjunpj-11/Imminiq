import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import { useAuthStore } from '../../auth/store/useAuthStore'
import type {
  ApiErrorResponse,
  ApiResponse,
  RemoveAvatarResponse,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation<
    ApiResponse<RemoveAvatarResponse>,
    AxiosError<ApiErrorResponse>,
    void
  >({
    mutationFn: async () => {
      const response = await api.delete<ApiResponse<RemoveAvatarResponse>>(
        '/uploads/avatar'
      )

      return response.data
    },
    onSuccess: () => {
      if (user) {
        setUser({
          ...user,
          avatarUrl: undefined,
        })
      }

      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      })
    },
  })
}
