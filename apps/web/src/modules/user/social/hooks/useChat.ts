import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { CHAT_ENDPOINTS } from '../constants/chat.constants';
import type {
  IChatApiError,
  IChatApiResponse,
  IChatConversation,
  IChatMessage,
  IChatPage,
  IUserBlocks,
} from '../types/chat.types';
import { resolveOutgoingMessageKind } from '../utils/resolve-outgoing-message-kind';
import { socialQueryKeys } from './social.query-keys';

const shouldRetrySocialRequest = (
  failureCount: number,
  error: AxiosError<IChatApiError>
) => {
  const status = error.response?.status;
  return failureCount < 2 && (status === undefined || status >= 500);
};

export const useChatConversations = (limit: number, enabled = true) =>
  useInfiniteQuery<IChatPage<IChatConversation>, AxiosError<IChatApiError>>({
    queryKey: socialQueryKeys.chat.conversationList(limit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<IChatApiResponse<IChatPage<IChatConversation>>>(
        CHAT_ENDPOINTS.conversations,
        { params: { page: pageParam, limit } }
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    retry: shouldRetrySocialRequest,
    enabled,
    staleTime: 20_000,
  });

export const useChatMessages = (conversationId: string | null, limit: number) =>
  useInfiniteQuery<IChatPage<IChatMessage>, AxiosError<IChatApiError>>({
    queryKey: socialQueryKeys.chat.messages(conversationId ?? ''),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<IChatApiResponse<IChatPage<IChatMessage>>>(
        CHAT_ENDPOINTS.messages(conversationId ?? ''),
        { params: { page: pageParam, limit } }
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    retry: shouldRetrySocialRequest,
    enabled: Boolean(conversationId),
    staleTime: 10_000,
  });

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IChatConversation,
    AxiosError<IChatApiError>,
    { friendUserId: string }
  >({
    mutationFn: async (input) => {
      const response = await api.post<IChatApiResponse<IChatConversation>>(
        CHAT_ENDPOINTS.conversations,
        input
      );
      return response.data.data;
    },
    onSuccess: (conversation) => {
      queryClient.setQueriesData<InfiniteData<IChatPage<IChatConversation>>>(
        { queryKey: socialQueryKeys.chat.conversations() },
        (current) => {
          if (!current?.pages[0]) return current;
          const exists = current.pages.some((chatPage) =>
            chatPage.items.some((item) => item.id === conversation.id)
          );
          if (exists) return current;
          const firstPage = current.pages[0];
          return {
            ...current,
            pages: [
              {
                ...firstPage,
                items: [conversation, ...firstPage.items],
                pagination: {
                  ...firstPage.pagination,
                  total: firstPage.pagination.total + 1,
                },
              },
              ...current.pages.slice(1),
            ],
          };
        }
      );
    },
  });
};

export const useSendChatMessage = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation<
    IChatMessage,
    AxiosError<IChatApiError>,
    {
      text: string;
      kind: 'text' | 'code' | 'voice';
      codeLanguage?: string;
      file?: File;
      durationSeconds?: number;
    }
  >({
    mutationFn: async (input) => {
      const form = new FormData();
      form.set('kind', resolveOutgoingMessageKind(input.kind, input.file));
      if (input.text) form.set('text', input.text);
      if (input.codeLanguage) form.set('codeLanguage', input.codeLanguage);
      if (input.file) form.set('file', input.file);
      if (input.durationSeconds) {
        form.set('durationSeconds', String(input.durationSeconds));
      }
      const response = await api.post<IChatApiResponse<IChatMessage>>(
        CHAT_ENDPOINTS.messages(conversationId ?? ''),
        form
      );
      return response.data.data;
    },
    onSuccess: (message) => {
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(message.conversationId),
        (current) => {
          if (!current?.pages[0]) return current;
          if (current.pages.some((chatPage) => chatPage.items.some((item) => item.id === message.id))) {
            return current;
          }
          const firstPage = current.pages[0];
          return {
            ...current,
            pages: [
              {
                ...firstPage,
                items: [...firstPage.items, message],
                pagination: {
                  ...firstPage.pagination,
                  total: firstPage.pagination.total + 1,
                },
              },
              ...current.pages.slice(1),
            ],
          };
        }
      );
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.conversations(),
      });
    },
  });
};

export const useForwardChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IChatMessage,
    AxiosError<IChatApiError>,
    { messageId: string; targetConversationId: string }
  >({
    mutationFn: async ({ messageId, targetConversationId }) => {
      const response = await api.post<IChatApiResponse<IChatMessage>>(
        CHAT_ENDPOINTS.forward(messageId),
        { targetConversationId }
      );
      return response.data.data;
    },
    onSuccess: (message) => {
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.conversations(),
      });
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.messages(message.conversationId),
      });
    },
  });
};

export const useShareTrackerToChat = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IChatMessage,
    AxiosError<IChatApiError>,
    { trackerId: string; targetConversationId: string }
  >({
    mutationFn: async (input) => {
      const response = await api.post<IChatApiResponse<IChatMessage>>(
        CHAT_ENDPOINTS.trackerShares,
        input
      );
      return response.data.data;
    },
    onSuccess: (message) => {
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.conversations(),
      });
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.messages(message.conversationId),
      });
    },
  });
};

export const useBlockedUsers = () =>
  useQuery<IUserBlocks, AxiosError<IChatApiError>>({
    queryKey: socialQueryKeys.chat.blocks(),
    queryFn: async () => {
      const response = await api.get<IChatApiResponse<IUserBlocks>>(
        CHAT_ENDPOINTS.blocks
      );
      return response.data.data;
    },
    staleTime: 30_000,
  });

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserBlocks, AxiosError<IChatApiError>, string>({
    mutationFn: async (userId) => {
      const response = await api.post<IChatApiResponse<IUserBlocks>>(
        CHAT_ENDPOINTS.blocks,
        { userId }
      );
      return response.data.data;
    },
    onSuccess: (blocks) => {
      queryClient.setQueryData(socialQueryKeys.chat.blocks(), blocks);
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.conversations(),
      });
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.calls.all,
      });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserBlocks, AxiosError<IChatApiError>, string>({
    mutationFn: async (userId) => {
      const response = await api.delete<IChatApiResponse<IUserBlocks>>(
        CHAT_ENDPOINTS.block(userId)
      );
      return response.data.data;
    },
    onSuccess: (blocks) => {
      queryClient.setQueryData(socialQueryKeys.chat.blocks(), blocks);
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.conversations(),
      });
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.calls.all,
      });
    },
  });
};

export const useMarkChatRead = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, AxiosError<IChatApiError>, string>({
    mutationFn: async (conversationId) => {
      const response = await api.patch<IChatApiResponse<unknown>>(
        CHAT_ENDPOINTS.read(conversationId)
      );
      return response.data.data;
    },
    onSuccess: (_result, conversationId) => {
      queryClient.setQueriesData<InfiniteData<IChatPage<IChatConversation>>>(
        { queryKey: socialQueryKeys.chat.conversations() },
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((chatPage) => ({
                  ...chatPage,
                  items: chatPage.items.map((conversation) =>
                    conversation.id === conversationId
                      ? { ...conversation, unreadCount: 0 }
                      : conversation
                  ),
                })),
              }
            : current
      );
    },
  });
};
