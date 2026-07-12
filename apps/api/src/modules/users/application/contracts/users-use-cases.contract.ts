import type * as Application from '../index'
export type UsersUseCases = {
  getMe: Application.GetMeUseCase
  updateMe: Application.UpdateMeUseCase
  getUserByUsername: Application.GetUserByUsernameUseCase
  getMyStats: Application.GetMyStatsUseCase
  getMyActivity: Application.GetMyActivityUseCase
  getMyRecentActivity: Application.GetMyRecentActivityUseCase
  getMyStreak: Application.GetMyStreakUseCase
  getMyPublishedTrackers: Application.GetMyPublishedTrackersUseCase
  getMyBadges: Application.GetMyBadgesUseCase
  getPublicProfilePage: Application.GetPublicProfilePageUseCase
}
