import type { CommunityMemberStatsEntity } from '../entities/community-member-stats.entity';
import type { CommunityTrackerEntity } from '../entities/community-tracker.entity';
import type { CommunitySort } from '../community.types';

export type FindCommunityTrackersQuery = {
  userId: string;
  search?: string;
  topics?: string[];
  minRating?: number | null;
  verifiedOnly?: boolean;
  sort?: CommunitySort;
  recentSearches?: string[];
  page: number;
  limit: number;
};

export type CommunityTrackerPageResult = {
  items: CommunityTrackerEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface ICommunityTrackerRepository {
  findPublicTrackers(query: FindCommunityTrackersQuery): Promise<CommunityTrackerPageResult>;

  findCommunityTrackerById(
    trackerId: string,
    userId: string
  ): Promise<CommunityTrackerEntity | null>;

  cloneTrackerForUser(
    trackerId: string,
    userId: string,
    options?: { bypassClonePermission?: boolean }
  ): Promise<CommunityTrackerEntity | null>;

  getPersonalStats(userId: string): Promise<CommunityMemberStatsEntity>;

  findAvailableTopics(): Promise<string[]>;
}
