import type * as Application from './index';

export type ChatUseCases = {
  listConversations: Application.IListChatConversationsUseCase;
  startConversation: Application.IStartChatConversationUseCase;
  listMessages: Application.IListChatMessagesUseCase;
  sendMessage: Application.ISendChatMessageUseCase;
  markConversationRead: Application.IMarkChatConversationReadUseCase;
  forwardMessage: Application.IForwardChatMessageUseCase;
  shareTracker: Application.IShareTrackerToChatUseCase;
  listBlockedUsers: Application.IListBlockedUsersUseCase;
  blockUser: Application.IBlockUserUseCase;
  unblockUser: Application.IUnblockUserUseCase;
};
