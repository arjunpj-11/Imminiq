import { User } from '../../../../../../infrastructure/database/models/user.model';
import type { ICallParticipantRepository } from '../../../domain/repositories/call-participant.repository.interface';
import { MongoCallBaseRepository } from '../shared/mongo-call-base.repository';
import { MongoCallMapper } from '../shared/mongo-call.mapper';
import { MongoCallNormalizer } from '../shared/mongo-call-normalizer';
import type { MongoCallParticipantRecord } from '../shared/mongo-call.types';

export class MongoCallParticipantRepository
  extends MongoCallBaseRepository
  implements ICallParticipantRepository
{
  constructor(private readonly _mapper = new MongoCallMapper()) {
    super();
  }

  async findParticipants(userIds: string[]) {
    return this.execute(
      'CALL_PARTICIPANTS_READ_FAILED',
      'Failed to load call participants',
      async () => {
        const records = await User.find({
          _id: {
            $in: userIds.map((id) =>
              MongoCallNormalizer.toObjectId(id, 'INVALID_CALL_PARTICIPANT_ID')
            ),
          },
          status: 'active',
          deletedAt: null,
        })
          .select('fullName username avatarUrl')
          .lean<MongoCallParticipantRecord[]>();
        return new Map(
          records.map((record) => [record._id.toString(), this._mapper.toParticipantEntity(record)])
        );
      }
    );
  }
}

export const mongoCallParticipantRepository = new MongoCallParticipantRepository();
