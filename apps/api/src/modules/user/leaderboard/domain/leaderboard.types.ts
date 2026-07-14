export type { LeaderboardScope } from './value-objects/leaderboard-scope.vo';
export type { LeaderboardSection } from './value-objects/leaderboard-section.vo';

export type LeaderboardTimeRange = {
  start: Date;
  end: Date;
};

export type LeaderboardXpActivitySource =
  | 'subtopic_mastery'
  | 'mock_test_perfect'
  | 'daily_inquiry'
  | 'peer_review'
  | 'tracker_published'
  | 'tracker_verified'
  | 'verification_submission'
  | 'verification_majority_win'
  | 'student_milestone'
  | 'community_vote'
  | 'manual_adjustment'
  | (string & {});
