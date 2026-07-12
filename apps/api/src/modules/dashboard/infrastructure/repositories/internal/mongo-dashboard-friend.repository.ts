import { Friend } from '../../../../../infrastructure/database/models/friend.model'
import { User } from '../../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../../infrastructure/database/models/user-profile.model'
import { DASHBOARD_DEFAULT_FRIENDS_LIMIT } from '../../../domain/dashboard.constants'
import type { DashboardFriendEntity } from '../../../domain/entities/dashboard-friend.entity'
import type { GetFriendsHubInput } from '../../../domain/repositories/dashboard-friend.repository.interface'
import type {
  MongoFriendRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
} from '../shared/mongo-dashboard.types'
import { MongoDashboardBaseRepository } from '../shared/mongo-dashboard-base.repository'
import { MongoDashboardErrorMapper } from '../shared/mongo-dashboard-error.mapper'
import { MongoDashboardMapper } from '../shared/mongo-dashboard.mapper'
import { MongoDashboardQueryUtils } from '../shared/mongo-dashboard-query.utils'

export class MongoDashboardFriendRepository extends MongoDashboardBaseRepository {
  constructor(private readonly _mapper = new MongoDashboardMapper()) {
    super()
  }

  async getFriendsHub(
    input: GetFriendsHubInput,
  ): Promise<DashboardFriendEntity[]> {
    return this.execute(
      'DASHBOARD_FRIEND_READ_FAILED',
      'Failed to read dashboard friends',
      async () => {
        const { userId, limit = DASHBOARD_DEFAULT_FRIENDS_LIMIT } = input

        const friendships = (await Friend.find({
          $or: [{ userId }, { friendId: userId }],
          deletedAt: null,
        })
          .limit(
            MongoDashboardQueryUtils.safeLimit(
              limit,
              DASHBOARD_DEFAULT_FRIENDS_LIMIT,
            ),
          )
          .lean()) as MongoFriendRecord[]

        if (friendships.length === 0) {
          return []
        }

        const friendIds = friendships.map((friendship) =>
          this._mapper.toId(friendship.userId) === userId
            ? this._mapper.toId(friendship.friendId)
            : this._mapper.toId(friendship.userId),
        )

        const [friends, friendProfiles] = await Promise.all([
          User.find({
            _id: { $in: friendIds },
            deletedAt: null,
          })
            .select('_id fullName username lastActiveAt')
            .lean<MongoUserRecord[]>(),
          UserProfile.find({
            userId: { $in: friendIds },
            deletedAt: null,
          })
            .select('userId avatarUrl')
            .lean<MongoUserProfileRecord[]>(),
        ])

        const profileMap = new Map(
          friendProfiles.map((profile) => [
            this._mapper.toId(profile.userId),
            profile.avatarUrl ?? '',
          ]),
        )

        return friends.map((friend) =>
          this._mapper.toDashboardFriendEntity(friend, profileMap),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }
}

export const mongoDashboardFriendRepository =
  new MongoDashboardFriendRepository()
