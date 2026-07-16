import type {
  CreateTopicContributionResult,
  ListTopicContributionsResult,
  ReviewTopicContributionResult,
} from '../tracker-topic-contribution.types';

export interface ITrackerTopicContributionRepository {
  create(input: {
    cloneTrackerId: string;
    cloneTopicId: string;
    requesterId: string;
  }): Promise<CreateTopicContributionResult>;
  listForOwner(input: {
    sourceTrackerId: string;
    ownerId: string;
  }): Promise<ListTopicContributionsResult>;
  review(input: {
    sourceTrackerId: string;
    contributionId: string;
    ownerId: string;
    action: 'approve' | 'reject';
    reviewNote?: string;
  }): Promise<ReviewTopicContributionResult>;
}
