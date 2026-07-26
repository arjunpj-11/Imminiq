import type { IChatRepository } from '../../domain/repositories/chat.repository.interface';
import type { IChatConversationCommandRepository } from '../../domain/repositories/chat-conversation-command.repository.interface';
import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { IChatParticipantRepository } from '../../domain/repositories/chat-participant.repository.interface';
import type { IChatRelationshipRepository } from '../../domain/repositories/chat-relationship.repository.interface';
import type {
  CreateChatMessageCommandInput,
  ListChatConversationsInput,
  ListChatMessagesInput,
} from '../../domain/chat.types';
import {
  mongoChatConversationRepository,
} from './internal/mongo-chat-conversation.repository';
import {
  mongoChatMessageRepository,
} from './internal/mongo-chat-message.repository';
import {
  mongoChatParticipantRepository,
} from './internal/mongo-chat-participant.repository';
import {
  mongoChatRelationshipRepository,
} from './internal/mongo-chat-relationship.repository';

type MongoChatRepositoryDependencies = {
  conversationRepository: IChatConversationQueryRepository &
    IChatConversationCommandRepository;
  messageRepository: IChatMessageQueryRepository & IChatMessageCommandRepository;
  participantRepository: IChatParticipantRepository;
  relationshipRepository: IChatRelationshipRepository;
};

export class MongoChatRepository implements IChatRepository {
  constructor(
    private readonly _dependencies: MongoChatRepositoryDependencies = {
      conversationRepository: mongoChatConversationRepository,
      messageRepository: mongoChatMessageRepository,
      participantRepository: mongoChatParticipantRepository,
      relationshipRepository: mongoChatRelationshipRepository,
    }
  ) {}

  listConversations(input: ListChatConversationsInput) {
    return this._dependencies.conversationRepository.listConversations(input);
  }

  findConversationForParticipant(conversationId: string, participantUserId: string) {
    return this._dependencies.conversationRepository.findConversationForParticipant(
      conversationId,
      participantUserId
    );
  }

  findOrCreateConversation(firstUserId: string, secondUserId: string) {
    return this._dependencies.conversationRepository.findOrCreateConversation(
      firstUserId,
      secondUserId
    );
  }

  listMessages(input: ListChatMessagesInput) {
    return this._dependencies.messageRepository.listMessages(input);
  }

  findMessagesByIds(messageIds: string[]) {
    return this._dependencies.messageRepository.findMessagesByIds(messageIds);
  }

  findLatestVisibleMessages(conversationIds: string[], viewerUserId: string) {
    return this._dependencies.messageRepository.findLatestVisibleMessages(
      conversationIds,
      viewerUserId
    );
  }

  findUnreadCounts(conversationIds: string[], viewerUserId: string) {
    return this._dependencies.messageRepository.findUnreadCounts(
      conversationIds,
      viewerUserId
    );
  }

  createMessage(input: CreateChatMessageCommandInput) {
    return this._dependencies.messageRepository.createMessage(input);
  }

  markConversationRead(conversationId: string, viewerUserId: string) {
    return this._dependencies.messageRepository.markConversationRead(
      conversationId,
      viewerUserId
    );
  }

  toggleMessageStar(messageId: string, viewerUserId: string) {
    return this._dependencies.messageRepository.toggleMessageStar(
      messageId,
      viewerUserId
    );
  }

  clearConversationMessages(conversationId: string, viewerUserId: string) {
    return this._dependencies.messageRepository.clearConversationMessages(
      conversationId,
      viewerUserId
    );
  }

  findParticipants(userIds: string[]) {
    return this._dependencies.participantRepository.findParticipants(userIds);
  }

  areActiveFriends(firstUserId: string, secondUserId: string) {
    return this._dependencies.relationshipRepository.areActiveFriends(
      firstUserId,
      secondUserId
    );
  }
}

export const mongoChatRepository = new MongoChatRepository();
