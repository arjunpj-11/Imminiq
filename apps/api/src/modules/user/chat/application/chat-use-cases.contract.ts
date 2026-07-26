import type * as Application from './index';

export type ChatUseCases = {
  listConversations: Application.IListChatConversationsUseCase;
  startConversation: Application.IStartChatConversationUseCase;
  listMessages: Application.IListChatMessagesUseCase;
  sendMessage: Application.ISendChatMessageUseCase;
  markConversationRead: Application.IMarkChatConversationReadUseCase;
  forwardMessage: Application.IForwardChatMessageUseCase;
  shareTracker: Application.IShareTrackerToChatUseCase;
  shareProfile: Application.IShareProfileToChatUseCase;
  listBlockedUsers: Application.IListBlockedUsersUseCase;
  blockUser: Application.IBlockUserUseCase;
  unblockUser: Application.IUnblockUserUseCase;
  toggleMessageStar: Application.IToggleChatMessageStarUseCase;
  clearConversation: Application.IClearChatConversationUseCase;
  toggleMessageReaction: Application.IToggleChatMessageReactionUseCase;
  editMessage: Application.IEditChatMessageUseCase;
  deleteMessage: Application.IDeleteChatMessageUseCase;
  listSavedMessages: Application.IListSavedChatMessagesUseCase;
};
