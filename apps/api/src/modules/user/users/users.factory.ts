import type { UsersUseCases } from './application/users-use-cases.contract'
import {
  UsersMapper,
} from './application/users.mapper'
import {
  UsersProfileDataReader,
} from './application/services/users-profile-data.service'
import { GetMeUseCase } from './application/use-cases/get-me.usecase'
import { GetMyBadgesUseCase } from './application/use-cases/get-my-badges.usecase'
import { GetMyPublishedTrackersUseCase } from './application/use-cases/get-my-published-trackers.usecase'
import { GetMyRecentActivityUseCase } from './application/use-cases/get-my-recent-activity.usecase'
import { GetMyStatsUseCase } from './application/use-cases/get-my-stats.usecase'
import { GetMyStreakUseCase } from './application/use-cases/get-my-streak.usecase'
import { GetPublicProfilePageUseCase } from './application/use-cases/get-public-profile-page.usecase'
import { GetUserByUsernameUseCase } from './application/use-cases/get-user-by-username.usecase'
import { UpdateMeUseCase } from './application/use-cases/update-me.usecase'
import { mongoUsersRepository } from './infrastructure/repositories/mongo-users.repository'
import { systemClock } from '../../../infrastructure/time/system-clock'


export type UsersComposition = {
  useCases: UsersUseCases
}

export const createUsersComposition = (): UsersComposition => {
  const usersRepository = mongoUsersRepository
  const usersMapper = new UsersMapper()

  const profileDataReader = new UsersProfileDataReader(
    usersRepository,
    usersMapper,
    systemClock,
  )

  return {
    useCases: {
      getMe: new GetMeUseCase(
        usersRepository,
        usersMapper
      ),

      updateMe: new UpdateMeUseCase(
        usersRepository,
        usersMapper
      ),

      getUserByUsername: new GetUserByUsernameUseCase(
        usersRepository,
        usersMapper
      ),

      getMyStats: new GetMyStatsUseCase(
        profileDataReader
      ),

      getMyRecentActivity: new GetMyRecentActivityUseCase(
        usersRepository,
        usersMapper
      ),

      getMyStreak: new GetMyStreakUseCase(
        profileDataReader
      ),

      getMyPublishedTrackers: new GetMyPublishedTrackersUseCase(
        usersRepository,
        usersMapper
      ),

      getMyBadges: new GetMyBadgesUseCase(
        usersRepository,
        usersMapper
      ),

      getPublicProfilePage: new GetPublicProfilePageUseCase(
        usersRepository,
        usersMapper,
        profileDataReader
      ),
    },
  }
}
