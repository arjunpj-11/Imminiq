import { Battle } from '../../../../../infrastructure/database/models/battle.model'
import { User } from '../../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../../infrastructure/database/models/user-profile.model'
import { DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT } from '../../../domain/constants/dashboard.constants'
import type { DashboardBattleEntity } from '../../../domain/entities/dashboard-battle.entity'
import type { GetRecentBattlesInput } from '../../../domain/repositories/dashboard-battle.repository.interface'
import type {
  MongoBattleRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
} from '../shared/mongo-dashboard.types'
import { MongoDashboardBaseRepository } from '../shared/mongo-dashboard-base.repository'
import { MongoDashboardErrorMapper } from '../shared/mongo-dashboard-error.mapper'
import { MongoDashboardMapper } from '../shared/mongo-dashboard.mapper'
import { MongoDashboardQueryUtils } from '../shared/mongo-dashboard-query.utils'

export class MongoDashboardBattleRepository extends MongoDashboardBaseRepository {
  constructor(private readonly _mapper = new MongoDashboardMapper()) {
    super()
  }

  async getRecentBattles(
    input: GetRecentBattlesInput,
  ): Promise<DashboardBattleEntity[]> {
    return this.execute(
      'DASHBOARD_BATTLE_READ_FAILED',
      'Failed to read recent dashboard battles',
      async () => {
        const { userId, limit = DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT } = input

        const battles = (await Battle.find({
          $or: [{ playerOneId: userId }, { playerTwoId: userId }],
          status: 'completed',
          deletedAt: null,
        })
          .sort({ endedAt: -1, updatedAt: -1 })
          .limit(
            MongoDashboardQueryUtils.safeLimit(
              limit,
              DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT,
            ),
          )
          .select(
            '_id playerOneId playerTwoId winnerId playerOneScore playerTwoScore startedAt endedAt updatedAt',
          )
          .lean()) as MongoBattleRecord[]

        if (battles.length === 0) {
          return []
        }

        const opponentIds = battles.map((battle) =>
          this._mapper.getOpponentId(battle, userId),
        )

        const [opponents, opponentProfiles] = await Promise.all([
          User.find({
            _id: { $in: opponentIds },
            deletedAt: null,
          })
            .select('_id fullName username')
            .lean<MongoUserRecord[]>(),
          UserProfile.find({
            userId: { $in: opponentIds },
            deletedAt: null,
          })
            .select('userId avatarUrl')
            .lean<MongoUserProfileRecord[]>(),
        ])

        const opponentMap = new Map(
          opponents.map((opponent) => [
            this._mapper.toId(opponent._id),
            opponent,
          ]),
        )

        const profileMap = new Map(
          opponentProfiles.map((profile) => [
            this._mapper.toId(profile.userId),
            profile.avatarUrl ?? '',
          ]),
        )

        return battles.map((battle) =>
          this._mapper.toDashboardBattleEntity(
            battle,
            userId,
            opponentMap,
            profileMap,
          ),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }
}

export const mongoDashboardBattleRepository =
  new MongoDashboardBattleRepository()
