import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { paginationConfig } from '../../../../config/pagination';
import api from '../../../../lib/axios';
import { friendsQueryKeys } from '../../friends';
import { CHAT_ENDPOINTS } from '../constants/chat.constants';
import type {
  IChatApiError,
  IChatApiResponse,
  IChatConversation,
  IChatMessage,
  IChatPage,
  IClearChatResult,
  IUserBlocks,
} from '../types/chat.types';
import { resolveOutgoingMessageKind } from '../utils/resolve-outgoing-message-kind';
import { socialQueryKeys } from './social.query-keys';

const shouldRetrySocialRequest = (failureCount: number, error: AxiosError<IChatApiError>) => {
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
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<IChatApiResponse<IChatPage<IChatMessage>>>(
        CHAT_ENDPOINTS.messages(conversationId ?? ''),
        { params: { limit, ...(pageParam ? { before: pageParam } : {}) } }
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    retry: shouldRetrySocialRequest,
    enabled: Boolean(conversationId),
    staleTime: 10_000,
  });

export const useSearchChatMessages = (conversationId: string | null, search: string) =>
  useQuery<IChatPage<IChatMessage>, AxiosError<IChatApiError>>({
    queryKey: socialQueryKeys.chat.messageSearch(conversationId ?? '', search),
    queryFn: async () => {
      const response = await api.get<IChatApiResponse<IChatPage<IChatMessage>>>(
        CHAT_ENDPOINTS.messages(conversationId ?? ''),
        { params: { page: 1, limit: paginationConfig.lookupLimit, search } }
      );
      return response.data.data;
    },
    enabled: Boolean(conversationId && search.trim()),
    retry: shouldRetrySocialRequest,
    staleTime: 20_000,
  });

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation<IChatConversation, AxiosError<IChatApiError>, { friendUserId: string }>({
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
      replyToMessageId?: string;
      onUploadProgress?: (percentage: number) => void;
    },
    { previous?: InfiniteData<IChatPage<IChatMessage>>; clientId: string }
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
      if (input.replyToMessageId) form.set('replyToMessageId', input.replyToMessageId);
      const response = await api.post<IChatApiResponse<IChatMessage>>(
        CHAT_ENDPOINTS.messages(conversationId ?? ''),
        form,
        {
          onUploadProgress: input.onUploadProgress
            ? (event) => {
                if (!event.total) return;
                input.onUploadProgress?.(
                  Math.min(100, Math.round((event.loaded / event.total) * 100))
                );
              }
            : undefined,
        }
      );
      return response.data.data;
    },
    onMutate: async (input) => {
      const targetId = conversationId ?? '';
      await queryClient.cancelQueries({
        queryKey: socialQueryKeys.chat.messages(targetId),
      });
      const previous = queryClient.getQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(targetId)
      );
      const clientId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: IChatMessage = {
        id: clientId,
        clientId,
        conversationId: targetId,
        senderId: '',
        kind: resolveOutgoingMessageKind(input.kind, input.file),
        text: input.text,
        codeLanguage: input.codeLanguage ?? null,
        attachment: input.file
          ? {
              url: input.file.type.startsWith('image/') ? URL.createObjectURL(input.file) : '',
              name: input.file.name,
              mimeType: input.file.type,
              sizeBytes: input.file.size,
              durationSeconds: input.durationSeconds ?? null,
            }
          : null,
        sharedTracker: null,
        sharedProfile: null,
        isForwarded: false,
        replyTo: input.replyToMessageId
          ? (() => {
              const source = previous?.pages
                .flatMap((chatPage) => chatPage.items)
                .find((item) => item.id === input.replyToMessageId);
              return source
                ? {
                    messageId: source.id,
                    senderId: source.senderId,
                    kind: source.kind,
                    text: source.text.slice(0, 240),
                  }
                : null;
            })()
          : null,
        reactions: [],
        editedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRead: false,
        isStarred: false,
        deliveryState: 'sending',
        retryPayload: input,
      };
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(targetId),
        (current) => {
          if (!current?.pages[0]) return current;
          const firstPage = current.pages[0];
          return {
            ...current,
            pages: [
              { ...firstPage, items: [...firstPage.items, optimistic] },
              ...current.pages.slice(1),
            ],
          };
        }
      );
      return { previous, clientId };
    },
    onSuccess: (message, _input, context) => {
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(message.conversationId),
        (current) => {
          if (!current?.pages[0]) return current;
          const pendingMessage = current.pages
            .flatMap((chatPage) => chatPage.items)
            .find((item) => item.clientId === context.clientId);
          if (pendingMessage?.attachment?.url.startsWith('blob:')) {
            URL.revokeObjectURL(pendingMessage.attachment.url);
          }
          const withoutPending = current.pages.map((chatPage) => ({
            ...chatPage,
            items: chatPage.items.filter((item) => item.clientId !== context.clientId),
          }));
          if (
            withoutPending.some((chatPage) => chatPage.items.some((item) => item.id === message.id))
          ) {
            return { ...current, pages: withoutPending };
          }
          const firstPage = withoutPending[0]!;
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
              ...withoutPending.slice(1),
            ],
          };
        }
      );
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.conversations(),
      });
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(conversationId ?? ''),
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((chatPage) => ({
                  ...chatPage,
                  items: chatPage.items.map((message) =>
                    message.clientId === context.clientId
                      ? { ...message, deliveryState: 'failed' as const }
                      : message
                  ),
                })),
              }
            : context.previous
      );
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

export const useToggleChatMessageStar = () => {
  const queryClient = useQueryClient();
  return useMutation<IChatMessage, AxiosError<IChatApiError>, string>({
    mutationFn: async (messageId) => {
      const response = await api.patch<IChatApiResponse<IChatMessage>>(
        CHAT_ENDPOINTS.star(messageId)
      );
      return response.data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(updated.conversationId),
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((chatPage) => ({
                  ...chatPage,
                  items: chatPage.items.map((message) =>
                    message.id === updated.id ? updated : message
                  ),
                })),
              }
            : current
      );
    },
  });
};

const replaceCachedMessage = (
  current: InfiniteData<IChatPage<IChatMessage>> | undefined,
  updated: IChatMessage
) =>
  current
    ? {
        ...current,
        pages: current.pages.map((chatPage) => ({
          ...chatPage,
          items: chatPage.items.map((message) => (message.id === updated.id ? updated : message)),
        })),
      }
    : current;

export const useToggleChatMessageReaction = () => {
  const queryClient = useQueryClient();
  return useMutation<IChatMessage, AxiosError<IChatApiError>, { messageId: string; emoji: string }>(
    {
      mutationFn: async ({ messageId, emoji }) => {
        const response = await api.patch<IChatApiResponse<IChatMessage>>(
          CHAT_ENDPOINTS.reaction(messageId),
          { emoji }
        );
        return response.data.data;
      },
      onSuccess: (updated) => {
        queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
          socialQueryKeys.chat.messages(updated.conversationId),
          (current) => replaceCachedMessage(current, updated)
        );
        void queryClient.invalidateQueries({ queryKey: socialQueryKeys.chat.savedMessages() });
      },
    }
  );
};

export const useEditChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<IChatMessage, AxiosError<IChatApiError>, { messageId: string; text: string }>({
    mutationFn: async ({ messageId, text }) => {
      const response = await api.patch<IChatApiResponse<IChatMessage>>(
        CHAT_ENDPOINTS.message(messageId),
        { text }
      );
      return response.data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(updated.conversationId),
        (current) => replaceCachedMessage(current, updated)
      );
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.chat.conversations() });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.chat.savedMessages() });
    },
  });
};

export const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { messageId: string },
    AxiosError<IChatApiError>,
    { messageId: string; conversationId: string }
  >({
    mutationFn: async ({ messageId }) => {
      const response = await api.delete<IChatApiResponse<{ messageId: string }>>(
        CHAT_ENDPOINTS.message(messageId)
      );
      return response.data.data;
    },
    onSuccess: ({ messageId }, input) => {
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        socialQueryKeys.chat.messages(input.conversationId),
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((chatPage) => ({
                  ...chatPage,
                  items: chatPage.items.filter((message) => message.id !== messageId),
                })),
              }
            : current
      );
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.chat.conversations() });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.chat.savedMessages() });
    },
  });
};

export const useSavedChatMessages = (limit = paginationConfig.batchLimit) =>
  useQuery<IChatPage<IChatMessage>, AxiosError<IChatApiError>>({
    queryKey: socialQueryKeys.chat.savedMessages(),
    queryFn: async () => {
      const response = await api.get<IChatApiResponse<IChatPage<IChatMessage>>>(
        CHAT_ENDPOINTS.savedMessages,
        { params: { page: 1, limit } }
      );
      return response.data.data;
    },
    staleTime: 20_000,
  });

export const useClearChatConversation = () => {
  const queryClient = useQueryClient();
  return useMutation<IClearChatResult, AxiosError<IChatApiError>, string>({
    mutationFn: async (conversationId) => {
      const response = await api.delete<IChatApiResponse<IClearChatResult>>(
        CHAT_ENDPOINTS.clear(conversationId)
      );
      return response.data.data;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.messages(result.conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.chat.conversations(),
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

export const useShareProfileToChat = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IChatMessage,
    AxiosError<IChatApiError>,
    {
      targetConversationId: string;
      username: string;
    }
  >({
    mutationFn: async ({ targetConversationId, username }) => {
      const response = await api.post<IChatApiResponse<IChatMessage>>(
        CHAT_ENDPOINTS.profileShares,
        { targetConversationId, username }
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
      const response = await api.get<IChatApiResponse<IUserBlocks>>(CHAT_ENDPOINTS.blocks);
      return response.data.data;
    },
    staleTime: 30_000,
  });

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserBlocks, AxiosError<IChatApiError>, string>({
    mutationFn: async (userId) => {
      const response = await api.post<IChatApiResponse<IUserBlocks>>(CHAT_ENDPOINTS.blocks, {
        userId,
      });
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
      void queryClient.invalidateQueries({
        queryKey: friendsQueryKeys.all,
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
