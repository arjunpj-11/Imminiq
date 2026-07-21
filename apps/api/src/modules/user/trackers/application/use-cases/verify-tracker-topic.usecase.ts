import type { TrackerAIValidationDTO, VerifyTrackerTopicPayloadDTO } from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';

export interface IVerifyTrackerTopicUseCase {
  execute(input: VerifyTrackerTopicPayloadDTO): Promise<TrackerAIValidationDTO>;
}

export class VerifyTrackerTopicUseCase implements IVerifyTrackerTopicUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'findOwnedTrackerById'>,
    private readonly _trackerAIGateway: Pick<ITrackerAIGateway, 'verifyTrackerTopic'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: VerifyTrackerTopicPayloadDTO): Promise<TrackerAIValidationDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const result = await this._trackerAIGateway.verifyTrackerTopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      existingTopics: input.existingTopics,
    });

    return this._trackerMapper.toTrackerAIValidationDto(result);
  }
}
