import type { RoadmapLevel } from '../value-objects/roadmap-level.vo';

export type TrackerCreationResponseEntityProps = {
  id?: string;
  userId?: string;
  isCompleted?: boolean;
  preparingFor?: string;
  goal?: string;
  preferredLanguage?: string;
  currentLevel?: RoadmapLevel;
  completedStep?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export class TrackerCreationResponseEntity {
  readonly id: string | undefined;
  readonly userId: string | undefined;
  readonly isCompleted: boolean;
  readonly preparingFor: string | undefined;
  readonly goal: string | undefined;
  readonly preferredLanguage: string | undefined;
  readonly currentLevel: RoadmapLevel | undefined;
  readonly completedStep: number;
  readonly createdAt: Date | undefined;
  readonly updatedAt: Date | undefined;

  constructor(props: TrackerCreationResponseEntityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.isCompleted = props.isCompleted ?? false;
    this.preparingFor = props.preparingFor;
    this.goal = props.goal;
    this.preferredLanguage = props.preferredLanguage;
    this.currentLevel = props.currentLevel;
    this.completedStep = props.completedStep ?? 0;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
