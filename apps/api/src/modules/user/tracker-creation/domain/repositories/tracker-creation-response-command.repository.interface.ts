import type { TrackerCreationResponseEntity } from '../entities/tracker-creation-response.entity';
import type { RoadmapLevel } from '../value-objects/roadmap-level.vo';

export type SaveTrackerCreationStep1Input = {
  userId: string;
  topic: string;
  goal?: string;
  preferredLanguage: string;
};

export type SaveTrackerCreationStep2Input = {
  userId: string;
  level: RoadmapLevel;
};

export interface ITrackerCreationResponseCommandRepository {
  saveStep1(data: SaveTrackerCreationStep1Input): Promise<TrackerCreationResponseEntity | null>;

  saveStep2(data: SaveTrackerCreationStep2Input): Promise<TrackerCreationResponseEntity | null>;

  markCompleted(userId: string): Promise<TrackerCreationResponseEntity | null>;
}
