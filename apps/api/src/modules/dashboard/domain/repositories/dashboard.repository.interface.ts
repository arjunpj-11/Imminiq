import type { DashboardBattleRepositoryContract } from './dashboard-battle.repository.interface'
import type { DashboardFriendRepositoryContract } from './dashboard-friend.repository.interface'
import type { DashboardNotificationRepositoryContract } from './dashboard-notification.repository.interface'
import type { DashboardProfileRepositoryContract } from './dashboard-profile.repository.interface'
import type { DashboardRecommendationRepositoryContract } from './dashboard-recommendation.repository.interface'
import type { DashboardStreakRepositoryContract } from './dashboard-streak.repository.interface'
import type { DashboardTrackerRepositoryContract } from './dashboard-tracker.repository.interface'
import type { DashboardUserRepositoryContract } from './dashboard-user.repository.interface'

export interface DashboardRepositoryContract
  extends DashboardUserRepositoryContract,
    DashboardProfileRepositoryContract,
    DashboardStreakRepositoryContract,
    DashboardTrackerRepositoryContract,
    DashboardNotificationRepositoryContract,
    DashboardBattleRepositoryContract,
    DashboardFriendRepositoryContract,
    DashboardRecommendationRepositoryContract {}
