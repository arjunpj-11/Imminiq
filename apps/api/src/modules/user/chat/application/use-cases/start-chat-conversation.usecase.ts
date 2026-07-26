import { ChatConversationSummaryEntity } from '../../domain/entities/chat-conversation-summary.entity';
import type { IChatConversationCommandRepository } from '../../domain/repositories/chat-conversation-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { IChatParticipantRepository } from '../../domain/repositories/chat-participant.repository.interface';
import type { IChatRelationshipRepository } from '../../domain/repositories/chat-relationship.repository.interface';
import type {
  CreateConversationInputDTO,
  StartChatConversationViewDTO,
} from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';
import type { IChatParticipantPolicy } from '../chat-participant.policy';

export interface IStartChatConversationUseCase {
  execute(
    viewerUserId: string,
    payload: CreateConversationInputDTO
  ): Promise<StartChatConversationViewDTO>;
}

export class StartChatConversationUseCase implements IStartChatConversationUseCase {
  constructor(
    private readonly _conversationCommandRepository: IChatConversationCommandRepository,
    private readonly _messageQueryRepository: IChatMessageQueryRepository,
    private readonly _participantRepository: IChatParticipantRepository,
    private readonly _relationshipRepository: IChatRelationshipRepository,
    private readonly _participantPolicy: IChatParticipantPolicy,
    private readonly _chatMapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, payload: CreateConversationInputDTO) {
    this._participantPolicy.ensureDifferentUsers(viewerUserId, payload.friendUserId);
    if (
      !(await this._relationshipRepository.areActiveFriends(
        viewerUserId,
        payload.friendUserId
      ))
    ) {
      throw ChatApplicationError.friendsOnly();
    }

    const result = await this._conversationCommandRepository.findOrCreateConversation(
      viewerUserId,
      payload.friendUserId
    );
    const [participants, messages, unreadCounts] = await Promise.all([
      this._participantRepository.findParticipants([payload.friendUserId]),
      this._messageQueryRepository.findLatestVisibleMessages(
        [result.conversation.id],
        viewerUserId
      ),
      this._messageQueryRepository.findUnreadCounts(
        [result.conversation.id],
        viewerUserId
      ),
    ]);
    const participant = participants.get(payload.friendUserId);
    if (!participant) throw ChatApplicationError.participantNotFound();
    const summary = new ChatConversationSummaryEntity({
      conversation: result.conversation,
      participant,
      lastMessage: messages[0] ?? null,
      unreadCount: unreadCounts.get(result.conversation.id) ?? 0,
    });

    return {
      created: result.created,
      conversation: this._chatMapper.toConversationView(summary, viewerUserId),
    };
  }
}
