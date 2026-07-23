import { User } from '../../../../../../infrastructure/database/models/user.model';
import { UserSettings } from '../../../../../../infrastructure/database/models/user-settings.model';
import type { IChatParticipantRepository } from '../../../domain/repositories/chat-participant.repository.interface';
import { MongoChatBaseRepository } from '../shared/mongo-chat-base.repository';
import { MongoChatMapper } from '../shared/mongo-chat.mapper';
import { MongoChatNormalizer } from '../shared/mongo-chat-normalizer';
import type { MongoChatParticipantRecord } from '../shared/mongo-chat.types';

export class MongoChatParticipantRepository
  extends MongoChatBaseRepository
  implements IChatParticipantRepository
{
  constructor(private readonly _mapper = new MongoChatMapper()) {
    super();
  }

  async findParticipants(userIds: string[]) {
    if (userIds.length === 0) return new Map();
    return this.execute('CHAT_PARTICIPANT_READ_FAILED', 'Failed to load participants', async () => {
      const objectIds = userIds.map((id) =>
        MongoChatNormalizer.toObjectId(id, 'INVALID_CHAT_PARTICIPANT_ID')
      );
      const [records, settings] = await Promise.all([
        User.find({
          _id: { $in: objectIds },
          status: 'active',
          deletedAt: null,
        })
          .select('fullName username avatarUrl level lastActiveAt')
          .lean<MongoChatParticipantRecord[]>(),
        UserSettings.find({ userId: { $in: objectIds } })
          .select('userId privacy.showOnlineStatus')
          .lean<
            Array<{
              userId: { toString(): string };
              privacy?: { showOnlineStatus?: boolean };
            }>
          >(),
      ]);
      const visibilityByUser = new Map(
        settings.map((record) => [
          record.userId.toString(),
          record.privacy?.showOnlineStatus ?? true,
        ])
      );
      return new Map(
        records.map((record) => [
          record._id.toString(),
          this._mapper.toParticipantEntity({
            ...record,
            presenceVisible: visibilityByUser.get(record._id.toString()) ?? true,
          }),
        ])
      );
    });
  }
}

export const mongoChatParticipantRepository = new MongoChatParticipantRepository();
