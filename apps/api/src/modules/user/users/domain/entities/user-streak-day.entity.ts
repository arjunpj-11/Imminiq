import type { StreakIntensity } from '../value-objects/streak-intensity.vo';

export type UserStreakDayEntityProps = {
  date: Date | string;
  activityCount: number;
  intensityLevel: StreakIntensity;
  streakDay: number;
  isFrozen: boolean;
};

export class UserStreakDayEntity {
  readonly date: Date | string;
  readonly activityCount: number;
  readonly intensityLevel: StreakIntensity;
  readonly streakDay: number;
  readonly isFrozen: boolean;

  constructor(props: UserStreakDayEntityProps) {
    this.date = props.date;
    this.activityCount = props.activityCount;
    this.intensityLevel = props.intensityLevel;
    this.streakDay = props.streakDay;
    this.isFrozen = props.isFrozen;
  }
}
