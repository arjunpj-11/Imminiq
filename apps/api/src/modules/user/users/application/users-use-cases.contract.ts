import type * as Application from './index';
export type UsersUseCases = {
  getMe: Application.IGetMeUseCase;
  updateMe: Application.IUpdateMeUseCase;
  getUserByUsername: Application.IGetUserByUsernameUseCase;
  getMyStats: Application.IGetMyStatsUseCase;
  getMyRecentActivity: Application.IGetMyRecentActivityUseCase;
  getMyStreak: Application.IGetMyStreakUseCase;
  getMyPublishedTrackers: Application.IGetMyPublishedTrackersUseCase;
  getMyBadges: Application.IGetMyBadgesUseCase;
  getPublicProfilePage: Application.IGetPublicProfilePageUseCase;
};
