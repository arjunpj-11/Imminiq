import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatRelationshipRepository } from '../../domain/repositories/chat-relationship.repository.interface';
import type { ISharedProfileRepository } from '../../domain/repositories/shared-profile.repository.interface';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';
import type { ChatMessageDTO, ShareProfileInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IShareProfileToChatUseCase {
  execute(viewerUserId: string, input: ShareProfileInputDTO): Promise<ChatMessageDTO>;
}

export class ShareProfileToChatUseCase implements IShareProfileToChatUseCase {
  constructor(
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _messages: Pick<IChatMessageCommandRepository, 'createMessage'>,
    private readonly _profiles: ISharedProfileRepository,
    private readonly _relationships: IChatRelationshipRepository,
    private readonly _blocks: Pick<IChatBlockRepository, 'hasBlockBetween'>,
    private readonly _realtime: IChatRealtimePublisher,
    private readonly _mapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, input: ShareProfileInputDTO) {
    const [conversation, profile] = await Promise.all([
      this._conversations.findConversationForParticipant(input.targetConversationId, viewerUserId),
      this._profiles.findShareableProfile(input.username, viewerUserId),
    ]);

    if (!conversation) throw ChatApplicationError.conversationNotFound();
    if (!profile) throw ChatApplicationError.profileNotShareable();

    const recipientId = conversation.otherParticipantId(viewerUserId);
    if (!recipientId) throw ChatApplicationError.invalidParticipant();
    if (await this._blocks.hasBlockBetween(viewerUserId, recipientId)) {
      throw ChatApplicationError.userBlocked();
    }
    if (!(await this._relationships.areActiveFriends(viewerUserId, recipientId))) {
      throw ChatApplicationError.friendsOnly();
    }

    const message = await this._messages.createMessage({
      conversationId: conversation.id,
      senderId: viewerUserId,
      kind: 'profile',
      text: '',
      codeLanguage: null,
      attachment: null,
      sharedTracker: null,
      sharedProfile: profile,
      forwardedFromMessageId: null,
    });
    this._realtime.messageCreated(conversation.participantIds, message);
    return this._mapper.toMessageView(message, viewerUserId);
  }
}
