import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { IChatRelationshipRepository } from '../../domain/repositories/chat-relationship.repository.interface';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';
import type { ChatMessageDTO, ForwardChatMessageInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IForwardChatMessageUseCase {
  execute(viewerUserId: string, input: ForwardChatMessageInputDTO): Promise<ChatMessageDTO>;
}

export class ForwardChatMessageUseCase implements IForwardChatMessageUseCase {
  constructor(
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _messageQueries: Pick<IChatMessageQueryRepository, 'findMessagesByIds'>,
    private readonly _messageCommands: Pick<IChatMessageCommandRepository, 'createMessage'>,
    private readonly _relationships: IChatRelationshipRepository,
    private readonly _blocks: Pick<IChatBlockRepository, 'hasBlockBetween'>,
    private readonly _realtime: IChatRealtimePublisher,
    private readonly _mapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, input: ForwardChatMessageInputDTO) {
    const messages = await this._messageQueries.findMessagesByIds([input.messageId]);
    const source = messages[0];
    if (!source) throw ChatApplicationError.messageNotFound();
    const [sourceConversation, targetConversation] = await Promise.all([
      this._conversations.findConversationForParticipant(source.conversationId, viewerUserId),
      this._conversations.findConversationForParticipant(input.targetConversationId, viewerUserId),
    ]);
    if (!sourceConversation || !targetConversation) {
      throw ChatApplicationError.conversationNotFound();
    }
    const recipientId = targetConversation.otherParticipantId(viewerUserId);
    if (!recipientId) throw ChatApplicationError.invalidParticipant();
    if (await this._blocks.hasBlockBetween(viewerUserId, recipientId)) {
      throw ChatApplicationError.userBlocked();
    }
    if (!(await this._relationships.areActiveFriends(viewerUserId, recipientId))) {
      throw ChatApplicationError.friendsOnly();
    }

    const forwarded = await this._messageCommands.createMessage({
      conversationId: targetConversation.id,
      senderId: viewerUserId,
      kind: source.kind,
      text: source.text,
      codeLanguage: source.codeLanguage,
      attachment: source.attachment,
      sharedTracker: source.sharedTracker,
      sharedProfile: source.sharedProfile,
      forwardedFromMessageId: source.id,
    });
    this._realtime.messageCreated(targetConversation.participantIds, forwarded);
    return this._mapper.toMessageView(forwarded, viewerUserId);
  }
}
