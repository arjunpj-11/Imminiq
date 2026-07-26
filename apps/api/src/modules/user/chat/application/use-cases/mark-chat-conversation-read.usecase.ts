import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';
import type { ChatConversationReadViewDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';

export interface IMarkChatConversationReadUseCase {
  execute(viewerUserId: string, conversationId: string): Promise<ChatConversationReadViewDTO>;
}

export class MarkChatConversationReadUseCase implements IMarkChatConversationReadUseCase {
  constructor(
    private readonly _conversationQueryRepository: IChatConversationQueryRepository,
    private readonly _messageCommandRepository: Pick<
      IChatMessageCommandRepository,
      'markConversationRead'
    >,
    private readonly _realtimePublisher: IChatRealtimePublisher
  ) {}

  async execute(viewerUserId: string, conversationId: string) {
    const conversation = await this._conversationQueryRepository.findConversationForParticipant(
      conversationId,
      viewerUserId
    );
    if (!conversation) throw ChatApplicationError.conversationNotFound();
    const updatedCount = await this._messageCommandRepository.markConversationRead(
      conversationId,
      viewerUserId
    );
    const event = {
      conversationId,
      userId: viewerUserId,
      readAt: new Date(),
      updatedCount,
    };
    this._realtimePublisher.conversationRead(conversation.participantIds, event);
    return event;
  }
}
