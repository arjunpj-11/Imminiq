import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/useAuthStore'
import type {
  ApiErrorResponse,
  ApiResponse,
  ProfileImageUploadResponse,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

export const useUploadAvatar = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

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
      >('/uploads/avatar', formData)

      return response.data
    },
    onSuccess: (response) => {
      if (user) {
        setUser({
          ...user,
          avatarUrl: response.data.fileUrl,
        })
      }

      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      })
    },
  })
}
