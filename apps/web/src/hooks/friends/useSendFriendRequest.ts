import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'

interface SendFriendRequestPayload {
  receiverId: string
  message?: string
}

interface SendFriendRequestResponse {
  success: boolean
  message: string
  data?: {
    requestId?: string
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

export const useSendFriendRequest = () => {
  return useMutation<
    SendFriendRequestResponse,
    AxiosError<ApiErrorResponse>,
    SendFriendRequestPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<SendFriendRequestResponse>(
          '/friends/request',
          payload,
        )

      return response.data
    },
  })
}