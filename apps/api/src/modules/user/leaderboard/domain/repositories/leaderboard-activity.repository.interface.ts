import type { LeaderboardSection, LeaderboardXpActivitySource } from '../leaderboard.types';

export type RecordLeaderboardXpActivityInput = {
  userId: string;
  section: LeaderboardSection;
  amount: number;
  source: LeaderboardXpActivitySource;
  idempotencyKey: string;
  sourceEntityId?: string;
  occurredAt: Date;
  metadata?: Record<string, unknown>;
};

export type RecordLeaderboardXpActivityResult = {
  created: boolean;
};

export type ReplaceLeaderboardFriendsInput = {
  userId: string;
  friendUserIds: string[];
};

export type CaptureLeaderboardSnapshotInput = {
  section: LeaderboardSection;
  snapshotKey: string;
  capturedAt: Date;
};

export type CaptureLeaderboardSnapshotResult = {
  section: LeaderboardSection;
  capturedUsers: number;
};

export interface ILeaderboardActivityRepository {
  recordXpActivity(
    input: RecordLeaderboardXpActivityInput
  ): Promise<RecordLeaderboardXpActivityResult>;

  replaceFriendUserIds(input: ReplaceLeaderboardFriendsInput): Promise<void>;

  captureRankSnapshot(
    input: CaptureLeaderboardSnapshotInput
  ): Promise<CaptureLeaderboardSnapshotResult>;
}
