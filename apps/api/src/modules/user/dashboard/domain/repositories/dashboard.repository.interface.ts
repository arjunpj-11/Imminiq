import type { IDashboardBattleRepository } from './dashboard-battle.repository.interface';
import type { IDashboardFriendRepository } from './dashboard-friend.repository.interface';
import type { IDashboardNotificationRepository } from './dashboard-notification.repository.interface';
import type { IDashboardProfileRepository } from './dashboard-profile.repository.interface';
import type { IDashboardRecommendationRepository } from './dashboard-recommendation.repository.interface';
import type { IDashboardStreakRepository } from './dashboard-streak.repository.interface';
import type { IDashboardTrackerRepository } from './dashboard-tracker.repository.interface';
import type { IDashboardUserRepository } from './dashboard-user.repository.interface';

export interface IDashboardRepository
  extends
    IDashboardUserRepository,
    IDashboardProfileRepository,
    IDashboardStreakRepository,
    IDashboardTrackerRepository,
    IDashboardNotificationRepository,
    IDashboardBattleRepository,
    IDashboardFriendRepository,
    IDashboardRecommendationRepository {}
