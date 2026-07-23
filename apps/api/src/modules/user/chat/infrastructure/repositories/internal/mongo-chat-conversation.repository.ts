import { ChatConversation } from '../../../../../../infrastructure/database/models/chat-conversation.model';
import type { IChatConversationCommandRepository } from '../../../domain/repositories/chat-conversation-command.repository.interface';
import type { IChatConversationQueryRepository } from '../../../domain/repositories/chat-conversation-query.repository.interface';
import type { ListChatConversationsInput } from '../../../domain/chat.types';
import { MongoChatBaseRepository } from '../shared/mongo-chat-base.repository';
import { isMongoDuplicateKeyError } from '../shared/mongo-chat-error.mapper';
import { MongoChatMapper } from '../shared/mongo-chat.mapper';
import { MongoChatNormalizer } from '../shared/mongo-chat-normalizer';
import type { MongoChatConversationRecord } from '../shared/mongo-chat.types';

export class MongoChatConversationRepository
  extends MongoChatBaseRepository
  implements IChatConversationQueryRepository, IChatConversationCommandRepository
{
  constructor(private readonly _mapper = new MongoChatMapper()) {
    super();
  }

  async listConversations(input: ListChatConversationsInput) {
    return this.execute('CHAT_CONVERSATION_LIST_FAILED', 'Failed to load conversations', async () => {
      const viewerUserId = MongoChatNormalizer.toObjectId(
        input.viewerUserId,
        'INVALID_CHAT_VIEWER_ID'
      );
      const filter = { participantIds: viewerUserId, deletedAt: null };
      const skip = (input.page - 1) * input.limit;
      const [records, total] = await Promise.all([
        ChatConversation.find(filter)
          .sort({ lastMessageAt: -1, updatedAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .lean<MongoChatConversationRecord[]>(),
        ChatConversation.countDocuments(filter),
      ]);
      return {
        items: records.map((record) => this._mapper.toConversationEntity(record)),
        page: input.page,
        limit: input.limit,
        total,
        hasMore: skip + records.length < total,
      };
    });
  }

  async findConversationForParticipant(conversationId: string, participantUserId: string) {
    return this.execute('CHAT_CONVERSATION_READ_FAILED', 'Failed to load conversation', async () => {
      const record = await ChatConversation.findOne({
        _id: MongoChatNormalizer.toObjectId(conversationId, 'INVALID_CHAT_CONVERSATION_ID'),
        participantIds: MongoChatNormalizer.toObjectId(
          participantUserId,
          'INVALID_CHAT_PARTICIPANT_ID'
        ),
        deletedAt: null,
      }).lean<MongoChatConversationRecord | null>();
      return record ? this._mapper.toConversationEntity(record) : null;
    });
  }

  async findOrCreateConversation(firstUserId: string, secondUserId: string) {
    return this.execute('CHAT_CONVERSATION_WRITE_FAILED', 'Failed to start conversation', async () => {
      const pair = MongoChatNormalizer.pair(firstUserId, secondUserId);
      const existing = await ChatConversation.findOne({
        pairKey: pair.pairKey,
        deletedAt: null,
      }).lean<MongoChatConversationRecord | null>();
      if (existing) {
        return { conversation: this._mapper.toConversationEntity(existing), created: false };
      }
      try {
        const created = await ChatConversation.create({
          pairKey: pair.pairKey,
          participantIds: pair.participantIds,
          deletedAt: null,
        });
        return {
          conversation: this._mapper.toConversationEntity(
            created.toObject() as unknown as MongoChatConversationRecord
          ),
          created: true,
        };
      } catch (error) {
        if (!isMongoDuplicateKeyError(error)) throw error;
        const raced = await ChatConversation.findOne({
          pairKey: pair.pairKey,
          deletedAt: null,
        }).lean<MongoChatConversationRecord | null>();
        if (!raced) throw error;
        return { conversation: this._mapper.toConversationEntity(raced), created: false };
      }
    });
  }
}

export const mongoChatConversationRepository = new MongoChatConversationRepository();
