import type {
  ITrackerContributionNotifier,
  ITrackerTopicContributionRepository,
  TrackerTopicContributionRecord,
} from '../../domain';
import { TrackerApplicationError } from '../tracker-application.error';

export interface IReviewTopicContributionUseCase {
  execute(input: {
    trackerId: string;
    contributionId: string;
    userId: string;
    action: 'approve' | 'reject';
    reviewNote?: string;
  }): Promise<TrackerTopicContributionRecord>;
}

export class ReviewTopicContributionUseCase implements IReviewTopicContributionUseCase {
  constructor(
    private readonly _repository: ITrackerTopicContributionRepository,
    private readonly _notifier: ITrackerContributionNotifier
  ) {}

  async execute(input: {
    trackerId: string;
    contributionId: string;
    userId: string;
    action: 'approve' | 'reject';
    reviewNote?: string;
  }) {
    const result = await this._repository.review({
      sourceTrackerId: input.trackerId,
      contributionId: input.contributionId,
      ownerId: input.userId,
      action: input.action,
      reviewNote: input.reviewNote,
    });
    if (!result.ok) {
      if (result.reason === 'already-reviewed') {
        throw TrackerApplicationError.contributionAlreadyReviewed();
      }
      if (result.reason === 'source-unavailable') {
        throw TrackerApplicationError.contributionSourceUnavailable();
      }
      if (result.reason === 'tracker-not-found') throw TrackerApplicationError.trackerNotFound();
      throw TrackerApplicationError.contributionNotFound();
    }

    await this._notifier.contributionReviewed(result);
    return result.contribution;
  }
}
