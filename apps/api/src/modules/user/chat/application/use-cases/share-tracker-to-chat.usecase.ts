import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { ISharedTrackerRepository } from '../../domain/repositories/shared-tracker.repository.interface';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';
import type { ChatMessageDTO, ShareTrackerInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IShareTrackerToChatUseCase {
  execute(viewerUserId: string, input: ShareTrackerInputDTO): Promise<ChatMessageDTO>;
}

export class ShareTrackerToChatUseCase implements IShareTrackerToChatUseCase {
  constructor(
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _messages: Pick<IChatMessageCommandRepository, 'createMessage'>,
    private readonly _trackers: ISharedTrackerRepository,
    private readonly _blocks: Pick<IChatBlockRepository, 'hasBlockBetween'>,
    private readonly _realtime: IChatRealtimePublisher,
    private readonly _mapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, input: ShareTrackerInputDTO) {
    const [conversation, tracker] = await Promise.all([
      this._conversations.findConversationForParticipant(
        input.targetConversationId,
        viewerUserId
      ),
      this._trackers.findShareableTracker(input.trackerId, viewerUserId),
    ]);
    if (!conversation) throw ChatApplicationError.conversationNotFound();
    if (!tracker) throw ChatApplicationError.trackerNotShareable();
    const recipientId = conversation.otherParticipantId(viewerUserId);
    if (!recipientId) throw ChatApplicationError.invalidParticipant();
    if (await this._blocks.hasBlockBetween(viewerUserId, recipientId)) {
      throw ChatApplicationError.userBlocked();
    }

    const message = await this._messages.createMessage({
      conversationId: conversation.id,
      senderId: viewerUserId,
      kind: 'tracker',
      text: '',
      codeLanguage: null,
      attachment: null,
      sharedTracker: tracker,
      forwardedFromMessageId: null,
    });
    this._realtime.messageCreated(conversation.participantIds, message);
    return this._mapper.toMessageView(message, viewerUserId);
  }
}
