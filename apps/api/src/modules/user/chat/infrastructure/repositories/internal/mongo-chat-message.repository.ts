import { ChatConversation } from '../../../../../../infrastructure/database/models/chat-conversation.model';
import { ChatMessage } from '../../../../../../infrastructure/database/models/chat-message.model';
import type { IChatMessageCommandRepository } from '../../../domain/repositories/chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../../domain/repositories/chat-message-query.repository.interface';
import type {
  CreateChatMessageCommandInput,
  ListChatMessagesInput,
} from '../../../domain/chat.types';
import { MongoChatBaseRepository } from '../shared/mongo-chat-base.repository';
import { MongoChatMapper } from '../shared/mongo-chat.mapper';
import { MongoChatNormalizer } from '../shared/mongo-chat-normalizer';
import type {
  MongoChatMessageRecord,
  MongoChatUnreadCountRecord,
} from '../shared/mongo-chat.types';

export class MongoChatMessageRepository
  extends MongoChatBaseRepository
  implements IChatMessageQueryRepository, IChatMessageCommandRepository
{
  constructor(private readonly _mapper = new MongoChatMapper()) {
    super();
  }

  async listMessages(input: ListChatMessagesInput) {
    return this.execute('CHAT_MESSAGE_LIST_FAILED', 'Failed to load messages', async () => {
      const conversationId = MongoChatNormalizer.toObjectId(
        input.conversationId,
        'INVALID_CHAT_CONVERSATION_ID'
      );
      const filter = { conversationId, deletedAt: null };
      const skip = (input.page - 1) * input.limit;
      const [records, total] = await Promise.all([
        ChatMessage.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .lean<MongoChatMessageRecord[]>(),
        ChatMessage.countDocuments(filter),
      ]);
      return {
        items: records
          .map((record) => this._mapper.toMessageEntity(record))
          .reverse(),
        page: input.page,
        limit: input.limit,
        total,
        hasMore: skip + records.length < total,
      };
    });
  }

  async findMessagesByIds(messageIds: string[]) {
    if (messageIds.length === 0) return [];
    return this.execute('CHAT_MESSAGE_READ_FAILED', 'Failed to load messages', async () => {
      const records = await ChatMessage.find({
        _id: {
          $in: messageIds.map((id) =>
            MongoChatNormalizer.toObjectId(id, 'INVALID_CHAT_MESSAGE_ID')
          ),
        },
        deletedAt: null,
      }).lean<MongoChatMessageRecord[]>();
      return records.map((record) => this._mapper.toMessageEntity(record));
    });
  }

  async findUnreadCounts(conversationIds: string[], viewerUserId: string) {
    if (conversationIds.length === 0) return new Map<string, number>();
    return this.execute('CHAT_UNREAD_COUNT_FAILED', 'Failed to load unread counts', async () => {
      const viewerId = MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const records = await ChatMessage.aggregate<MongoChatUnreadCountRecord>([
        {
          $match: {
            conversationId: {
              $in: conversationIds.map((id) =>
                MongoChatNormalizer.toObjectId(id, 'INVALID_CHAT_CONVERSATION_ID')
              ),
            },
            senderId: { $ne: viewerId },
            readBy: { $ne: viewerId },
            deletedAt: null,
          },
        },
        { $group: { _id: '$conversationId', count: { $sum: 1 } } },
      ]);
      return new Map(records.map((record) => [record._id.toString(), record.count]));
    });
  }

  async createMessage(input: CreateChatMessageCommandInput) {
    return this.execute('CHAT_MESSAGE_WRITE_FAILED', 'Failed to send message', async () => {
      const created = await ChatMessage.create({
        conversationId: MongoChatNormalizer.toObjectId(
          input.conversationId,
          'INVALID_CHAT_CONVERSATION_ID'
        ),
        senderId: MongoChatNormalizer.toObjectId(input.senderId, 'INVALID_CHAT_SENDER_ID'),
        kind: input.kind,
        text: input.text,
        codeLanguage: input.codeLanguage,
        attachment: input.attachment,
        sharedTracker: input.sharedTracker
          ? {
              ...input.sharedTracker,
              trackerId: MongoChatNormalizer.toObjectId(
                input.sharedTracker.trackerId,
                'INVALID_SHARED_TRACKER_ID'
              ),
            }
          : null,
        forwardedFromMessageId: input.forwardedFromMessageId
          ? MongoChatNormalizer.toObjectId(
              input.forwardedFromMessageId,
              'INVALID_FORWARDED_MESSAGE_ID'
            )
          : null,
        readBy: [
          MongoChatNormalizer.toObjectId(input.senderId, 'INVALID_CHAT_SENDER_ID'),
        ],
        deletedAt: null,
      });
      await ChatConversation.updateOne(
        { _id: input.conversationId, deletedAt: null },
        { $set: { lastMessageId: created._id, lastMessageAt: created.createdAt } }
      );
      return this._mapper.toMessageEntity(
        created.toObject() as unknown as MongoChatMessageRecord
      );
    });
  }

  async markConversationRead(conversationId: string, viewerUserId: string) {
    return this.execute('CHAT_READ_UPDATE_FAILED', 'Failed to mark conversation read', async () => {
      const conversationObjectId = MongoChatNormalizer.toObjectId(
        conversationId,
        'INVALID_CHAT_CONVERSATION_ID'
      );
      const viewerObjectId = MongoChatNormalizer.toObjectId(
        viewerUserId,
        'INVALID_CHAT_VIEWER_ID'
      );
      const result = await ChatMessage.updateMany(
        {
          conversationId: conversationObjectId,
          senderId: { $ne: viewerObjectId },
          readBy: { $ne: viewerObjectId },
          deletedAt: null,
        },
        { $addToSet: { readBy: viewerObjectId } }
      );
      return result.modifiedCount;
    });
  }
}

export const mongoChatMessageRepository = new MongoChatMessageRepository();
