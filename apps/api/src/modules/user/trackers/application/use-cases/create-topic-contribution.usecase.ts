import type {
  ITrackerContributionNotifier,
  ITrackerTopicContributionRepository,
  TrackerTopicContributionRecord,
} from '../../domain';
import { TrackerApplicationError } from '../tracker-application.error';

export interface ICreateTopicContributionUseCase {
  execute(input: {
    trackerId: string;
    topicId: string;
    userId: string;
  }): Promise<TrackerTopicContributionRecord>;
}

export class CreateTopicContributionUseCase implements ICreateTopicContributionUseCase {
  constructor(
    private readonly _repository: ITrackerTopicContributionRepository,
    private readonly _notifier: ITrackerContributionNotifier
  ) {}

  async execute(input: { trackerId: string; topicId: string; userId: string }) {
    const result = await this._repository.create({
      cloneTrackerId: input.trackerId,
      cloneTopicId: input.topicId,
      requesterId: input.userId,
    });
    if (!result.ok) {
      if (result.reason === 'not-a-clone') throw TrackerApplicationError.contributionRequiresClone();
      if (result.reason === 'not-a-change') throw TrackerApplicationError.contributionNotAChange();
      if (result.reason === 'source-unavailable') {
        throw TrackerApplicationError.contributionSourceUnavailable();
      }
      if (result.reason === 'topic-not-found') throw TrackerApplicationError.topicNotFound();
      if (result.reason === 'duplicate') throw TrackerApplicationError.contributionAlreadyExists();
      throw TrackerApplicationError.trackerNotFound();
    }

    await this._notifier.contributionRequested(result);
    return result.contribution;
  }
}
