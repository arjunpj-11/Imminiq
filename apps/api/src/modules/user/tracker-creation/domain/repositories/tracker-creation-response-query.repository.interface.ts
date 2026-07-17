import type { TrackerCreationResponseEntity } from '../entities/tracker-creation-response.entity';

export interface ITrackerCreationResponseQueryRepository {
  getStatus(userId: string): Promise<TrackerCreationResponseEntity | null>;
}
