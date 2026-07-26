import { ChatMapper } from './application/chat.mapper';
import { ChatParticipantPolicy } from './application/chat-participant.policy';
import type { ChatUseCases } from './application/chat-use-cases.contract';
import { BlockUserUseCase } from './application/use-cases/block-user.usecase';
import { ForwardChatMessageUseCase } from './application/use-cases/forward-chat-message.usecase';
import { ListChatConversationsUseCase } from './application/use-cases/list-chat-conversations.usecase';
import { ListChatMessagesUseCase } from './application/use-cases/list-chat-messages.usecase';
import { ListBlockedUsersUseCase } from './application/use-cases/list-blocked-users.usecase';
import { MarkChatConversationReadUseCase } from './application/use-cases/mark-chat-conversation-read.usecase';
import { SendChatMessageUseCase } from './application/use-cases/send-chat-message.usecase';
import { ShareTrackerToChatUseCase } from './application/use-cases/share-tracker-to-chat.usecase';
import { ShareProfileToChatUseCase } from './application/use-cases/share-profile-to-chat.usecase';
import { StartChatConversationUseCase } from './application/use-cases/start-chat-conversation.usecase';
import { UnblockUserUseCase } from './application/use-cases/unblock-user.usecase';
import { ToggleChatMessageStarUseCase } from './application/use-cases/toggle-chat-message-star.usecase';
import { ClearChatConversationUseCase } from './application/use-cases/clear-chat-conversation.usecase';
import { DeleteChatMessageUseCase } from './application/use-cases/delete-chat-message.usecase';
import { EditChatMessageUseCase } from './application/use-cases/edit-chat-message.usecase';
import { ToggleChatMessageReactionUseCase } from './application/use-cases/toggle-chat-message-reaction.usecase';
import { ListSavedChatMessagesUseCase } from './application/use-cases/list-saved-chat-messages.usecase';
import { cloudinaryChatFileStorageGateway } from './infrastructure/gateways/cloudinary-chat-file-storage.gateway';
import { mongoChatBlockRepository } from './infrastructure/repositories/internal/mongo-chat-block.repository';
import { mongoSharedTrackerRepository } from './infrastructure/repositories/internal/mongo-shared-tracker.repository';
import { mongoSharedProfileRepository } from './infrastructure/repositories/internal/mongo-shared-profile.repository';
import { mongoChatRepository } from './infrastructure/repositories/mongo-chat.repository';
import { socketChatRealtimePublisher } from './infrastructure/services/socket-chat-realtime.publisher';
import { chatPresenceProvider } from '../../../infrastructure/realtime/chat-presence.provider';

export type ChatComposition = {
  useCases: ChatUseCases;
};

export const createChatComposition = (): ChatComposition => {
  const mapper = new ChatMapper(chatPresenceProvider);
  const participantPolicy = new ChatParticipantPolicy();

  return {
    useCases: {
      listConversations: new ListChatConversationsUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mongoChatBlockRepository,
        mapper
      ),
      startConversation: new StartChatConversationUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        participantPolicy,
        mapper
      ),
      listMessages: new ListChatMessagesUseCase(mongoChatRepository, mongoChatRepository, mapper),
      sendMessage: new SendChatMessageUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mongoChatBlockRepository,
        cloudinaryChatFileStorageGateway,
        socketChatRealtimePublisher,
        mapper
      ),
      markConversationRead: new MarkChatConversationReadUseCase(
        mongoChatRepository,
        mongoChatRepository,
        socketChatRealtimePublisher
      ),
      forwardMessage: new ForwardChatMessageUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mongoChatBlockRepository,
        socketChatRealtimePublisher,
        mapper
      ),
      shareTracker: new ShareTrackerToChatUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoSharedTrackerRepository,
        mongoChatRepository,
        mongoChatBlockRepository,
        socketChatRealtimePublisher,
        mapper
      ),
      shareProfile: new ShareProfileToChatUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoSharedProfileRepository,
        mongoChatRepository,
        mongoChatBlockRepository,
        socketChatRealtimePublisher,
        mapper
      ),
      listBlockedUsers: new ListBlockedUsersUseCase(mongoChatBlockRepository),
      blockUser: new BlockUserUseCase(
        mongoChatBlockRepository,
        participantPolicy,
        socketChatRealtimePublisher
      ),
      unblockUser: new UnblockUserUseCase(mongoChatBlockRepository, socketChatRealtimePublisher),
      toggleMessageStar: new ToggleChatMessageStarUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mapper
      ),
      clearConversation: new ClearChatConversationUseCase(mongoChatRepository, mongoChatRepository),
      toggleMessageReaction: new ToggleChatMessageReactionUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mapper
      ),
      editMessage: new EditChatMessageUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository,
        mapper
      ),
      deleteMessage: new DeleteChatMessageUseCase(
        mongoChatRepository,
        mongoChatRepository,
        mongoChatRepository
      ),
      listSavedMessages: new ListSavedChatMessagesUseCase(mongoChatRepository, mapper),
    },
  };
};
