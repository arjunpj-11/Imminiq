import type {
  ITrackerTopicContributionRepository,
  TrackerTopicContributionRecord,
} from '../../domain';
import { TrackerApplicationError } from '../tracker-application.error';
import type { TrackerAccessPayloadDTO } from '../tracker.dto';

export interface IListTopicContributionsUseCase {
  execute(input: TrackerAccessPayloadDTO): Promise<TrackerTopicContributionRecord[]>;
}

export class ListTopicContributionsUseCase implements IListTopicContributionsUseCase {
  constructor(private readonly _repository: ITrackerTopicContributionRepository) {}

  async execute(input: TrackerAccessPayloadDTO) {
    const result = await this._repository.listForOwner({
      sourceTrackerId: input.trackerId,
      ownerId: input.userId,
    });
    if (!result.ok) throw TrackerApplicationError.trackerNotFound();
    return result.contributions;
  }
}
