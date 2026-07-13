import type { CommunityPublicTrackerDetailEntity } from '../entities/community-public-tracker-detail.entity';
import type { CommunityTrackerReviewEntity } from '../entities/community-tracker-review.entity';

export type UpsertCommunityTrackerReviewInput = {
  trackerId: string;
  userId: string;
  rating: number;
  comment: string;
};

export interface ICommunityReviewRepository {
  findPublicTrackerDetail(
    trackerId: string,
    userId: string
  ): Promise<CommunityPublicTrackerDetailEntity | null>;

  upsertTrackerReview(
    input: UpsertCommunityTrackerReviewInput
  ): Promise<CommunityTrackerReviewEntity | null>;

  toggleReviewHelpful(
    reviewId: string,
    userId: string
  ): Promise<CommunityTrackerReviewEntity | null>;

  toggleTrackerLike(
    trackerId: string,
    userId: string
  ): Promise<{
    liked: boolean;
    likes: number;
  } | null>;
}
