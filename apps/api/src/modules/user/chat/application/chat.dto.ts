import type { ChatMessageKind, UploadedChatFile } from '../domain/chat.types';

export type ListChatInputDTO = {
  page: number;
  limit: number;
};

export type CreateConversationInputDTO = {
  friendUserId: string;
};

export type SendChatMessageInputDTO = {
  conversationId: string;
  kind: ChatMessageKind;
  text?: string;
  codeLanguage?: string;
  file?: UploadedChatFile;
  durationSeconds?: number;
};

export type ForwardChatMessageInputDTO = {
  messageId: string;
  targetConversationId: string;
};

export type ShareTrackerInputDTO = {
  trackerId: string;
  targetConversationId: string;
};

export type UserBlockInputDTO = {
  userId: string;
};

export type UserBlocksViewDTO = {
  blockedUserIds: string[];
  blockedByUserIds: string[];
};

export type ChatParticipantDTO = {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl: string | null;
  level: number;
  isOnline: boolean;
  lastActiveAt: Date | null;
  presenceVisible: boolean;
};

export type ChatMessageDTO = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: ChatMessageKind;
  text: string;
  codeLanguage: string | null;
  attachment: {
    url: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
    durationSeconds: number | null;
  } | null;
  sharedTracker: {
    trackerId: string;
    title: string;
    description: string;
    visibility: 'private' | 'public' | 'unlisted';
  } | null;
  isForwarded: boolean;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
};

export type ChatConversationDTO = {
  id: string;
  participant: ChatParticipantDTO;
  lastMessage: ChatMessageDTO | null;
  lastMessageAt: Date | null;
  unreadCount: number;
};

export type ChatPageDTO<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type StartChatConversationViewDTO = {
  created: boolean;
  conversation: ChatConversationDTO;
};

export type ChatConversationReadViewDTO = {
  conversationId: string;
  userId: string;
  readAt: Date;
  updatedCount: number;
};
