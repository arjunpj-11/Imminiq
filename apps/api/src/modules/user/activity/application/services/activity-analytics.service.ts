import type {
  ActivityDailyGoalState,
  ActivityDayAggregateRecord,
} from '../../domain/activity.types';
import type { ActivityHeatmapIntensity } from '../../domain/value-objects/activity-heatmap-intensity.vo';

const DAY_IN_MS = 86_400_000;

export class ActivityAnalytics {
  calculateStreak(
    activeDateKeys: string[],
    todayKey: string,
    yesterdayKey: string
  ): {
    currentStreak: number;
    longestStreak: number;
  } {
    const uniqueSorted = [...new Set(activeDateKeys)].sort();

    if (uniqueSorted.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    let longestStreak = 1;
    let runningStreak = 1;

    for (let index = 1; index < uniqueSorted.length; index += 1) {
      const previous = uniqueSorted[index - 1];
      const current = uniqueSorted[index];

      if (!previous || !current) {
        continue;
      }

      const difference = this.dateKeyToTimestamp(current) - this.dateKeyToTimestamp(previous);

      if (difference === DAY_IN_MS) {
        runningStreak += 1;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else {
        runningStreak = 1;
      }
    }

    const activeSet = new Set(uniqueSorted);
    const currentAnchor = activeSet.has(todayKey)
      ? todayKey
      : activeSet.has(yesterdayKey)
        ? yesterdayKey
        : null;

    if (!currentAnchor) {
      return {
        currentStreak: 0,
        longestStreak,
      };
    }

    let currentStreak = 0;
    let cursor = this.dateKeyToTimestamp(currentAnchor);

    while (activeSet.has(new Date(cursor).toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor -= DAY_IN_MS;
    }

    return {
      currentStreak,
      longestStreak,
    };
  }

  heatmapIntensity(activityCount: number): ActivityHeatmapIntensity {
    if (activityCount <= 0) {
      return 'none';
    }

    if (activityCount <= 2) {
      return 'low';
    }

    if (activityCount <= 4) {
      return 'medium';
    }

    return 'high';
  }

  growthPercent(current: number, previous: number): number {
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  weeklyProgress(
    currentXp: number,
    targetXp: number
  ): {
    targetXp: number;
    xpToTarget: number;
    progressPercent: number;
  } {
    return {
      targetXp,
      xpToTarget: Math.max(0, targetXp - currentXp),
      progressPercent: Math.min(100, Math.round((currentXp / targetXp) * 100)),
    };
  }

  dailyGoal(
    state: ActivityDailyGoalState,
    rewardXp: number
  ): {
    completedTasks: number;
    totalTasks: number;
    completed: boolean;
    progressPercent: number;
    rewardXp: number;
  } {
    const completedTasks = [state.subtopicCompleted, state.mockTestCompleted].filter(
      Boolean
    ).length;

    const totalTasks = 2;

    return {
      completedTasks,
      totalTasks,
      completed: completedTasks === totalTasks,
      progressPercent: Math.round((completedTasks / totalTasks) * 100),
      rewardXp,
    };
  }

  sumXp(days: ActivityDayAggregateRecord[]): number {
    return days.reduce((total, day) => total + day.xp, 0);
  }

  private dateKeyToTimestamp(dateKey: string): number {
    return Date.parse(`${dateKey}T00:00:00.000Z`);
  }
}

export type ActivityAnalyticsContract = Pick<
  ActivityAnalytics,
  | 'calculateStreak'
  | 'heatmapIntensity'
  | 'growthPercent'
  | 'weeklyProgress'
  | 'dailyGoal'
  | 'sumXp'
>;
