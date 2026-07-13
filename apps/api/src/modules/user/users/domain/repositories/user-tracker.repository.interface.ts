import type { PublishedTrackerEntity } from '../entities/published-tracker.entity';
import type { PublishedTrackerQuery } from '../value-objects/published-tracker-query.vo';
import type { UserIdInput } from '../value-objects/user-id.vo';

export type PublishedTrackerListResult = {
  items: PublishedTrackerEntity[];
  total: number;
};

export type FindPublishedTrackersInput = {
  ownerId: UserIdInput;
  query: PublishedTrackerQuery;
  includePrivate?: boolean;
};

export interface IUserTrackerRepository {
  findPublishedTrackers(input: FindPublishedTrackersInput): Promise<PublishedTrackerListResult>;

  getPublishedTrackerMetrics(ownerId: UserIdInput): Promise<{
    publishedCount: number;
    cloneCount: number;
    likeCount: number;
    ratingAverage: number;
  }>;
}
