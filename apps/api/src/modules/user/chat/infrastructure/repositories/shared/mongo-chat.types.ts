import type { Types } from 'mongoose';
import type { ChatMessageKind } from '../../../domain/chat.types';

export type MongoChatConversationRecord = {
  _id: Types.ObjectId;
  participantIds: Types.ObjectId[];
  lastMessageId?: Types.ObjectId | null;
  lastMessageAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MongoChatMessageRecord = {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  kind: ChatMessageKind;
  text?: string;
  codeLanguage?: string | null;
  attachment?: {
    url: string;
    storagePublicId?: string | null;
    name: string;
    mimeType: string;
    sizeBytes: number;
    durationSeconds?: number | null;
  } | null;
  sharedTracker?: {
    trackerId: Types.ObjectId;
    title: string;
    description?: string;
    visibility: 'private' | 'public' | 'unlisted';
  } | null;
  sharedProfile?: {
    userId: Types.ObjectId;
    username: string;
    fullName: string;
    headline?: string;
    avatarUrl?: string | null;
  } | null;
  forwardedFromMessageId?: Types.ObjectId | null;
  replyTo?: {
    messageId: Types.ObjectId;
    senderId: Types.ObjectId;
    kind: ChatMessageKind;
    text?: string;
  } | null;
  reactions?: Array<{ emoji: string; userIds: Types.ObjectId[] }>;
  editedAt?: Date | null;
  readBy?: Types.ObjectId[];
  starredBy?: Types.ObjectId[];
  clearedFor?: Types.ObjectId[];
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MongoChatParticipantRecord = {
  _id: Types.ObjectId;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  level?: number;
  lastActiveAt?: Date | null;
  presenceVisible?: boolean;
};

export type MongoChatUnreadCountRecord = {
  _id: Types.ObjectId;
  count: number;
};

export type MongoDuplicateKeyError = {
  code: 11000;
};
