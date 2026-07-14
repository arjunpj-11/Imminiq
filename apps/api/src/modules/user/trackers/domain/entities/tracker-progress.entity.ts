export type TrackerProgressEntityProps = {
  id: string;
  userId: string;
  trackerId: string;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  completionPercentage: number;
  lastStudiedAt: Date | null;
  startedAt: Date;
  completedAt?: Date | null;
};

export class TrackerProgressEntity {
  readonly id: string;
  readonly userId: string;
  readonly trackerId: string;
  readonly totalTopics: number;
  readonly completedTopics: number;
  readonly totalSubtopics: number;
  readonly completedSubtopics: number;
  readonly completionPercentage: number;
  readonly lastStudiedAt: Date | null;
  readonly startedAt: Date;
  readonly completedAt?: Date | null;

  constructor(props: TrackerProgressEntityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.trackerId = props.trackerId;
    this.totalTopics = props.totalTopics;
    this.completedTopics = props.completedTopics;
    this.totalSubtopics = props.totalSubtopics;
    this.completedSubtopics = props.completedSubtopics;
    this.completionPercentage = props.completionPercentage;
    this.lastStudiedAt = props.lastStudiedAt;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
  }
}
