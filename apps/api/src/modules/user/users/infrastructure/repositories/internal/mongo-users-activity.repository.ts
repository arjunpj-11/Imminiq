import { ActivityLog } from '../../../../../../infrastructure/database/models/activity-log.model';
import { paginationConfig } from '../../../../../../config/pagination';
import type { UserActivityEntity } from '../../../domain/entities/user-activity.entity';
import type {
  FindRecentUserActivityInput,
  FindUserActivityFeedInput,
} from '../../../domain/repositories/users.repository.interface';
import { MongoUsersBaseRepository } from '../shared/mongo-users-base.repository';
import { MongoUsersMapper } from '../shared/mongo-users.mapper';
import { MongoUsersObjectId } from '../shared/mongo-users-object-id';
import { MONGO_USERS_ACTIVE_FILTER } from '../shared/mongo-users-query.constants';
import type { MongoActivityRecord } from '../shared/mongo-users.types';

export class MongoUsersActivityRepository extends MongoUsersBaseRepository {
  constructor(private readonly _mapper = new MongoUsersMapper()) {
    super();
  }

  async findActivityFeed(
    input: FindUserActivityFeedInput
  ): Promise<{ items: UserActivityEntity[]; total: number }> {
    return this.execute(
      'USER_ACTIVITY_READ_FAILED',
      'Failed to read user activity feed',
      async () => {
        const { userId, page = 1, limit = paginationConfig.profileLimit } = input;
        const skip = (page - 1) * limit;

        const filter = {
          userId: MongoUsersObjectId.from(userId),
          severity: 'info',
          ...MONGO_USERS_ACTIVE_FILTER,
        };

        const [items, total] = await Promise.all([
          ActivityLog.find(filter)
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean<MongoActivityRecord[]>(),
          ActivityLog.countDocuments(filter),
        ]);

        return {
          items: items.map((item) => this._mapper.toUserActivityEntity(item)),
          total,
        };
      }
    );
  }

  async findRecentActivity(input: FindRecentUserActivityInput): Promise<UserActivityEntity[]> {
    return this.execute(
      'USER_ACTIVITY_READ_FAILED',
      'Failed to read recent user activity',
      async () => {
        const { userId, limit = paginationConfig.profileLimit } = input;

        const items = await ActivityLog.find({
          userId: MongoUsersObjectId.from(userId),
          severity: 'info',
          ...MONGO_USERS_ACTIVE_FILTER,
        })
          .sort({
            createdAt: -1,
          })
          .limit(limit)
          .lean<MongoActivityRecord[]>();

        return items.map((item) => this._mapper.toUserActivityEntity(item));
      }
    );
  }
}

export const mongoUsersActivityRepository = new MongoUsersActivityRepository();
