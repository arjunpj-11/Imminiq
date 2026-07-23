import { ChatDomainError } from '../../domain/chat-domain.error';
import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatFileStorage } from '../../domain/services/chat-file-storage.interface';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';
import type { StoredChatFile, UploadedChatFile } from '../../domain/chat.types';
import type { ChatMessageDTO, SendChatMessageInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface ISendChatMessageUseCase {
  execute(viewerUserId: string, payload: SendChatMessageInputDTO): Promise<ChatMessageDTO>;
}

export class SendChatMessageUseCase implements ISendChatMessageUseCase {
  constructor(
    private readonly _conversationQueryRepository: IChatConversationQueryRepository,
    private readonly _messageCommandRepository: IChatMessageCommandRepository,
    private readonly _blocks: Pick<IChatBlockRepository, 'hasBlockBetween'>,
    private readonly _fileStorage: IChatFileStorage,
    private readonly _realtimePublisher: IChatRealtimePublisher,
    private readonly _chatMapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, payload: SendChatMessageInputDTO) {
    const conversation =
      await this._conversationQueryRepository.findConversationForParticipant(
        payload.conversationId,
        viewerUserId
      );
    if (!conversation) throw ChatApplicationError.conversationNotFound();
    const recipientId = conversation.otherParticipantId(viewerUserId);
    if (!recipientId) throw ChatApplicationError.invalidParticipant();
    if (await this._blocks.hasBlockBetween(viewerUserId, recipientId)) {
      throw ChatApplicationError.userBlocked();
    }

    const text = payload.text?.trim() ?? '';
    if (!text && !payload.file) throw ChatApplicationError.emptyMessage();
    if (payload.kind === 'code' && !text) throw ChatApplicationError.emptyCode();
    if (
      (payload.kind === 'image' || payload.kind === 'file' || payload.kind === 'voice') &&
      !payload.file
    ) {
      throw ChatApplicationError.fileRequired();
    }

    const storedAttachment = await this.storeAttachment(payload.file, viewerUserId);
    const attachment = storedAttachment
      ? {
          ...storedAttachment,
          ...(payload.kind === 'voice'
            ? { durationSeconds: Math.max(1, Math.min(600, payload.durationSeconds ?? 1)) }
            : {}),
        }
      : null;
    const kind = attachment
      ? payload.kind === 'voice'
        ? 'voice'
        : attachment.mimeType.startsWith('image/')
        ? 'image'
        : 'file'
      : payload.kind;
    const message = await this._messageCommandRepository.createMessage({
      conversationId: conversation.id,
      senderId: viewerUserId,
      kind,
      text,
      codeLanguage: kind === 'code' ? payload.codeLanguage?.trim() || 'plain text' : null,
      attachment,
    });
    this._realtimePublisher.messageCreated(conversation.participantIds, message);
    return this._chatMapper.toMessageView(message, viewerUserId);
  }

  private async storeAttachment(
    file: UploadedChatFile | undefined,
    viewerUserId: string
  ): Promise<StoredChatFile | null> {
    if (!file) return null;
    try {
      return await this._fileStorage.upload(file, viewerUserId);
    } catch (error) {
      if (error instanceof ChatDomainError && error.code === 'CHAT_UPLOAD_FAILED') {
        throw ChatApplicationError.uploadFailed();
      }
      throw error;
    }
  }
}
