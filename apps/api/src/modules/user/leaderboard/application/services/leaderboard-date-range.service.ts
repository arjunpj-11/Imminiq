import type { LeaderboardTimeRange } from '../../domain/leaderboard.types';

export type LeaderboardPeriods = {
  current: LeaderboardTimeRange;
  previous: LeaderboardTimeRange;
  previousSnapshotBefore: Date;
  snapshotKey: string;
};

export interface ILeaderboardDateRange {
  getPeriods(now: Date): LeaderboardPeriods;
  toSnapshotKey(date: Date): string;
}

export class LeaderboardDateRange implements ILeaderboardDateRange {
  getPeriods(now: Date): LeaderboardPeriods {
    const currentStart = this.startOfUtcWeek(now);
    const previousStart = new Date(currentStart);
    previousStart.setUTCDate(previousStart.getUTCDate() - 7);

    const elapsedInCurrentWeek = Math.max(0, now.getTime() - currentStart.getTime());

    const previousEnd = new Date(
      Math.min(currentStart.getTime(), previousStart.getTime() + elapsedInCurrentWeek)
    );

    return {
      current: {
        start: currentStart,
        end: now,
      },
      previous: {
        start: previousStart,
        end: previousEnd,
      },
      previousSnapshotBefore: currentStart,
      snapshotKey: this.toSnapshotKey(currentStart),
    };
  }

  toSnapshotKey(date: Date): string {
    return this.startOfUtcWeek(date).toISOString().slice(0, 10);
  }

  private startOfUtcWeek(date: Date): Date {
    const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    const day = result.getUTCDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    result.setUTCDate(result.getUTCDate() - daysSinceMonday);

    return result;
  }
}
