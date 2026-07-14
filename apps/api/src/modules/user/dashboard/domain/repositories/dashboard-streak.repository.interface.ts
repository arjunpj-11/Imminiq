import type { DashboardActivityIntensityEntity } from '../entities/dashboard-activity-intensity.entity';
import type { DashboardStreakEntity } from '../entities/dashboard-streak.entity';

export type GetActivityIntensityInput = {
  userId: string;
  months?: number;
};

export interface IDashboardStreakRepository {
  getStreakData(userId: string): Promise<DashboardStreakEntity>;

  getActivityIntensity(
    input: GetActivityIntensityInput
  ): Promise<DashboardActivityIntensityEntity[]>;
}
