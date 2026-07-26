export type ChatMessageKind =
  | 'text'
  | 'code'
  | 'image'
  | 'file'
  | 'voice'
  | 'tracker'
  | 'profile';

export type PaginatedChatResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ListChatConversationsInput = {
  viewerUserId: string;
  page: number;
  limit: number;
};

export type ListChatMessagesInput = {
  conversationId: string;
  viewerUserId: string;
  page: number;
  limit: number;
};

export type CreateChatMessageCommandInput = {
  conversationId: string;
  senderId: string;
  kind: ChatMessageKind;
  text: string;
  codeLanguage: string | null;
  attachment: StoredChatFile | null;
  sharedTracker?: SharedTracker | null;
  sharedProfile?: SharedProfile | null;
  forwardedFromMessageId?: string | null;
};

export type ChatConversationReadEvent = {
  conversationId: string;
  userId: string;
  readAt: Date;
  updatedCount: number;
};

export type ChatBlockStateEvent = {
  blockerUserId: string;
  blockedUserId: string;
  isBlocked: boolean;
};

export type UploadedChatFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type StoredChatFile = {
  url: string;
  storagePublicId?: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number | null;
};

export type SharedTracker = {
  trackerId: string;
  title: string;
  description: string;
  visibility: 'private' | 'public' | 'unlisted';
};

export type SharedProfile = {
  userId: string;
  username: string;
  fullName: string;
  headline: string;
  avatarUrl: string | null;
};
