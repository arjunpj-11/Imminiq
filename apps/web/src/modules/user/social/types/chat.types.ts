export type ChatMessageKind =
  | 'text'
  | 'code'
  | 'image'
  | 'file'
  | 'voice'
  | 'tracker';
export type ChatSection = 'chats' | 'friends' | 'requests' | 'calls';

export interface IChatParticipant {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl: string | null;
  level: number;
  isOnline: boolean;
  lastActiveAt: string | null;
  presenceVisible: boolean;
}

export interface IChatAttachment {
  url: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number | null;
}

export interface ISharedTracker {
  trackerId: string;
  title: string;
  description: string;
  visibility: 'private' | 'public' | 'unlisted';
}

export interface IChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  kind: ChatMessageKind;
  text: string;
  codeLanguage: string | null;
  attachment: IChatAttachment | null;
  sharedTracker: ISharedTracker | null;
  isForwarded: boolean;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}

export interface IChatConversation {
  id: string;
  participant: IChatParticipant;
  lastMessage: IChatMessage | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface IChatPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface IChatPage<T> {
  items: T[];
  pagination: IChatPagination;
}

export interface IChatApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IChatApiError {
  message?: string;
  code?: string;
}

export interface IUserBlocks {
  blockedUserIds: string[];
  blockedByUserIds: string[];
}
