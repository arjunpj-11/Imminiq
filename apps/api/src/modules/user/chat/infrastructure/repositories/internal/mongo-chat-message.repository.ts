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
      const viewerId = MongoChatNormalizer.toObjectId(input.viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const search = input.search?.trim();
      const beforeId = input.before
        ? MongoChatNormalizer.toObjectId(input.before, 'INVALID_CHAT_MESSAGE_ID')
        : null;
      const filter = {
        conversationId,
        clearedFor: { $ne: viewerId },
        deletedAt: null,
        ...(beforeId ? { _id: { $lt: beforeId } } : {}),
        ...(search
          ? {
              $or: [
                { text: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
                {
                  codeLanguage: {
                    $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                    $options: 'i',
                  },
                },
                {
                  'attachment.name': {
                    $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                    $options: 'i',
                  },
                },
              ],
            }
          : {}),
      };
      const skip = beforeId ? 0 : (input.page - 1) * input.limit;
      const [records, total] = await Promise.all([
        ChatMessage.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit + (beforeId ? 1 : 0))
          .lean<MongoChatMessageRecord[]>(),
        ChatMessage.countDocuments(filter),
      ]);
      const pageRecords = beforeId ? records.slice(0, input.limit) : records;
      const hasMore = beforeId ? records.length > input.limit : skip + records.length < total;
      return {
        items: pageRecords.map((record) => this._mapper.toMessageEntity(record)).reverse(),
        page: input.page,
        limit: input.limit,
        total,
        hasMore,
        nextCursor: hasMore && pageRecords.length ? String(pageRecords.at(-1)?._id ?? '') : null,
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

  async findLatestVisibleMessages(conversationIds: string[], viewerUserId: string) {
    if (conversationIds.length === 0) return [];
    return this.execute('CHAT_MESSAGE_READ_FAILED', 'Failed to load messages', async () => {
      const viewerId = MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const records = await ChatMessage.aggregate<MongoChatMessageRecord>([
        {
          $match: {
            conversationId: {
              $in: conversationIds.map((id) =>
                MongoChatNormalizer.toObjectId(id, 'INVALID_CHAT_CONVERSATION_ID')
              ),
            },
            clearedFor: { $ne: viewerId },
            deletedAt: null,
          },
        },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$conversationId', message: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$message' } },
      ]);
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
            clearedFor: { $ne: viewerId },
            deletedAt: null,
          },
        },
        { $group: { _id: '$conversationId', count: { $sum: 1 } } },
      ]);
      return new Map(records.map((record) => [record._id.toString(), record.count]));
    });
  }

  async listStarredMessages(viewerUserId: string, page: number, limit: number) {
    return this.execute('CHAT_MESSAGE_LIST_FAILED', 'Failed to load saved messages', async () => {
      const viewerId = MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const filter = {
        starredBy: viewerId,
        clearedFor: { $ne: viewerId },
        deletedAt: null,
      };
      const skip = (page - 1) * limit;
      const [records, total] = await Promise.all([
        ChatMessage.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<MongoChatMessageRecord[]>(),
        ChatMessage.countDocuments(filter),
      ]);
      return {
        items: records.map((record) => this._mapper.toMessageEntity(record)),
        page,
        limit,
        total,
        hasMore: skip + records.length < total,
      };
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
        sharedProfile: input.sharedProfile
          ? {
              ...input.sharedProfile,
              userId: MongoChatNormalizer.toObjectId(
                input.sharedProfile.userId,
                'INVALID_SHARED_PROFILE_ID'
              ),
            }
          : null,
        forwardedFromMessageId: input.forwardedFromMessageId
          ? MongoChatNormalizer.toObjectId(
              input.forwardedFromMessageId,
              'INVALID_FORWARDED_MESSAGE_ID'
            )
          : null,
        replyTo: input.replyTo
          ? {
              ...input.replyTo,
              messageId: MongoChatNormalizer.toObjectId(
                input.replyTo.messageId,
                'INVALID_CHAT_MESSAGE_ID'
              ),
              senderId: MongoChatNormalizer.toObjectId(
                input.replyTo.senderId,
                'INVALID_CHAT_SENDER_ID'
              ),
            }
          : null,
        reactions: [],
        editedAt: null,
        readBy: [MongoChatNormalizer.toObjectId(input.senderId, 'INVALID_CHAT_SENDER_ID')],
        starredBy: [],
        clearedFor: [],
        deletedAt: null,
      });
      await ChatConversation.updateOne(
        { _id: input.conversationId, deletedAt: null },
        { $set: { lastMessageId: created._id, lastMessageAt: created.createdAt } }
      );
      return this._mapper.toMessageEntity(created.toObject() as unknown as MongoChatMessageRecord);
    });
  }

  async markConversationRead(conversationId: string, viewerUserId: string) {
    return this.execute('CHAT_READ_UPDATE_FAILED', 'Failed to mark conversation read', async () => {
      const conversationObjectId = MongoChatNormalizer.toObjectId(
        conversationId,
        'INVALID_CHAT_CONVERSATION_ID'
      );
      const viewerObjectId = MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const result = await ChatMessage.updateMany(
        {
          conversationId: conversationObjectId,
          senderId: { $ne: viewerObjectId },
          readBy: { $ne: viewerObjectId },
          clearedFor: { $ne: viewerObjectId },
          deletedAt: null,
        },
        { $addToSet: { readBy: viewerObjectId } }
      );
      return result.modifiedCount;
    });
  }

  async toggleMessageStar(messageId: string, viewerUserId: string) {
    return this.execute('CHAT_MESSAGE_WRITE_FAILED', 'Failed to update message star', async () => {
      const messageObjectId = MongoChatNormalizer.toObjectId(messageId, 'INVALID_CHAT_MESSAGE_ID');
      const viewerObjectId = MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const current = await ChatMessage.findOne({
        _id: messageObjectId,
        clearedFor: { $ne: viewerObjectId },
        deletedAt: null,
      })
        .select('starredBy')
        .lean<{ starredBy?: unknown[] } | null>();
      if (!current) return null;
      const isStarred = (current.starredBy ?? []).some((userId) => String(userId) === viewerUserId);
      const updated = await ChatMessage.findOneAndUpdate(
        { _id: messageObjectId, clearedFor: { $ne: viewerObjectId }, deletedAt: null },
        isStarred
          ? { $pull: { starredBy: viewerObjectId } }
          : { $addToSet: { starredBy: viewerObjectId } },
        { returnDocument: 'after' }
      ).lean<MongoChatMessageRecord | null>();
      return updated ? this._mapper.toMessageEntity(updated) : null;
    });
  }

  async toggleMessageReaction(messageId: string, viewerUserId: string, emoji: string) {
    return this.execute('CHAT_MESSAGE_WRITE_FAILED', 'Failed to update reaction', async () => {
      const messageObjectId = MongoChatNormalizer.toObjectId(messageId, 'INVALID_CHAT_MESSAGE_ID');
      const viewerObjectId = MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const current = await ChatMessage.findOne({
        _id: messageObjectId,
        clearedFor: { $ne: viewerObjectId },
        deletedAt: null,
      }).lean<MongoChatMessageRecord | null>();
      if (!current) return null;
      const reactions = (current.reactions ?? []).map((reaction) => ({
        emoji: reaction.emoji,
        userIds: reaction.userIds.filter((userId) => String(userId) !== viewerUserId),
      }));
      const previouslySelected = (current.reactions ?? []).some(
        (reaction) =>
          reaction.emoji === emoji &&
          reaction.userIds.some((userId) => String(userId) === viewerUserId)
      );
      if (!previouslySelected) {
        const existing = reactions.find((reaction) => reaction.emoji === emoji);
        if (existing) existing.userIds.push(viewerObjectId);
        else reactions.push({ emoji, userIds: [viewerObjectId] });
      }
      const updated = await ChatMessage.findByIdAndUpdate(
        messageObjectId,
        { $set: { reactions: reactions.filter((reaction) => reaction.userIds.length > 0) } },
        { returnDocument: 'after' }
      ).lean<MongoChatMessageRecord | null>();
      return updated ? this._mapper.toMessageEntity(updated) : null;
    });
  }

  async editMessageText(messageId: string, viewerUserId: string, text: string) {
    return this.execute('CHAT_MESSAGE_WRITE_FAILED', 'Failed to edit message', async () => {
      const updated = await ChatMessage.findOneAndUpdate(
        {
          _id: MongoChatNormalizer.toObjectId(messageId, 'INVALID_CHAT_MESSAGE_ID'),
          senderId: MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID'),
          kind: { $in: ['text', 'code'] },
          deletedAt: null,
        },
        { $set: { text, editedAt: new Date() } },
        { returnDocument: 'after' }
      ).lean<MongoChatMessageRecord | null>();
      return updated ? this._mapper.toMessageEntity(updated) : null;
    });
  }

  async deleteMessage(messageId: string, viewerUserId: string) {
    return this.execute('CHAT_MESSAGE_WRITE_FAILED', 'Failed to delete message', async () => {
      const result = await ChatMessage.updateOne(
        {
          _id: MongoChatNormalizer.toObjectId(messageId, 'INVALID_CHAT_MESSAGE_ID'),
          senderId: MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID'),
          deletedAt: null,
        },
        { $set: { deletedAt: new Date() } }
      );
      return result.modifiedCount > 0;
    });
  }

  async clearConversationMessages(conversationId: string, viewerUserId: string) {
    return this.execute('CHAT_MESSAGE_WRITE_FAILED', 'Failed to clear conversation', async () => {
      const conversationObjectId = MongoChatNormalizer.toObjectId(
        conversationId,
        'INVALID_CHAT_CONVERSATION_ID'
      );
      const viewerObjectId = MongoChatNormalizer.toObjectId(viewerUserId, 'INVALID_CHAT_VIEWER_ID');
      const result = await ChatMessage.updateMany(
        {
          conversationId: conversationObjectId,
          starredBy: { $ne: viewerObjectId },
          clearedFor: { $ne: viewerObjectId },
          deletedAt: null,
        },
        { $addToSet: { clearedFor: viewerObjectId } }
      );
      return result.modifiedCount;
    });
  }
}

export const mongoChatMessageRepository = new MongoChatMessageRepository();
