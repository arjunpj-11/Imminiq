export type { CommunityLeaderboardEntryEntity as CommunityLeaderboardEntryRecord } from './entities/community-leaderboard-entry.entity';
export type { CommunityMemberStatsEntity as CommunityMemberStatsRecord } from './entities/community-member-stats.entity';
export type { CommunityReviewVoteEntity as CommunityReviewVoteRecord } from './entities/community-review-vote.entity';
export type { CommunityTrackerEntity as CommunityTrackerRecord } from './entities/community-tracker.entity';
export type { CommunityVerificationSubmissionEntity as CommunityVerificationSubmissionRecord } from './entities/community-verification-submission.entity';
export type CommunitySort = 'top-rated' | 'most-cloned' | 'newest';
export type CommunityTrackerStatus = 'public' | 'private' | 'archived';
export type VerificationSubmissionStatus = 'open' | 'closed' | 'approved' | 'rejected' | 'expired';
export type VerificationVoteChoice = 'pass' | 'fail';
