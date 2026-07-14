export type DashboardActiveTrackerEntityProps = {
  id: string;
  title: string;
  level: string;
  completionPercentage: number;
  lastStudiedAt: Date | null;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  updatedAt?: Date | null;
};

export class DashboardActiveTrackerEntity {
  readonly id: string;
  readonly title: string;
  readonly level: string;
  readonly completionPercentage: number;
  readonly lastStudiedAt: Date | null;
  readonly totalTopics: number;
  readonly completedTopics: number;
  readonly remainingTopics: number;
  readonly updatedAt: Date | null;

  constructor(props: DashboardActiveTrackerEntityProps) {
    this.id = props.id;
    this.title = props.title;
    this.level = props.level;
    this.completionPercentage = props.completionPercentage;
    this.lastStudiedAt = props.lastStudiedAt;
    this.totalTopics = props.totalTopics;
    this.completedTopics = props.completedTopics;
    this.remainingTopics = props.remainingTopics;
    this.updatedAt = props.updatedAt ?? null;
  }
}
