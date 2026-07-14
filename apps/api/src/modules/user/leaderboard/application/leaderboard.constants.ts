import type { LeaderboardSection } from '../domain/value-objects/leaderboard-section.vo';

export type LeaderboardScoringRule = {
  label: string;
  xpLabel: string;
  source: string;
};

export type LeaderboardReward = {
  title: string;
  description: string;
  targetRank: number;
  badgeName: string;
  coins: number;
};

export const LEADERBOARD_SCORING_RULES: Record<LeaderboardSection, LeaderboardScoringRule[]> = {
  students: [
    {
      label: 'Subtopic mastery',
      xpLabel: '+20 XP',
      source: 'subtopic_mastery',
    },
    {
      label: 'Mock test — perfect',
      xpLabel: '+100 XP',
      source: 'mock_test_perfect',
    },
    {
      label: 'Daily inquiry',
      xpLabel: '+15 XP',
      source: 'daily_inquiry',
    },
    {
      label: 'Peer review',
      xpLabel: '+50 XP',
      source: 'peer_review',
    },
  ],
  trainers: [
    {
      label: 'Tracker published',
      xpLabel: '+80 XP',
      source: 'tracker_published',
    },
    {
      label: 'Verification submitted',
      xpLabel: '+30 XP',
      source: 'verification_submission',
    },
    {
      label: 'Majority verification win',
      xpLabel: '+100 XP · 50 coins',
      source: 'verification_majority_win',
    },
    {
      label: 'Community vote',
      xpLabel: '+25 XP',
      source: 'community_vote',
    },
  ],
};
