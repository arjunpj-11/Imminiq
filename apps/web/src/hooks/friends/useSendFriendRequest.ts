import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'

interface ISendFriendRequestPayload {
  receiverId: string
  message?: string
}

interface ISendFriendRequestResponse {
  success: boolean
  message: string
  data?: {
    requestId?: string
  }
}

interface IApiErrorResponse {
  success?: boolean
  message?: string
}

export const useSendFriendRequest = () => {
  return useMutation<
    ISendFriendRequestResponse,
    AxiosError<IApiErrorResponse>,
    ISendFriendRequestPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<ISendFriendRequestResponse>(
          '/friends/request',
          payload,
        )

      return response.data
    },
  })
}