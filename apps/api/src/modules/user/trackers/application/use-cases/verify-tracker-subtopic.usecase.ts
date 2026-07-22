import type { TrackerAIValidationDTO, VerifyTrackerSubtopicPayloadDTO } from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';

export interface IVerifyTrackerSubtopicUseCase {
  execute(input: VerifyTrackerSubtopicPayloadDTO): Promise<TrackerAIValidationDTO>;
}

export class VerifyTrackerSubtopicUseCase implements IVerifyTrackerSubtopicUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'findOwnedTrackerById'>,
    private readonly _trackerAIGateway: Pick<ITrackerAIGateway, 'verifyTrackerSubtopic'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: VerifyTrackerSubtopicPayloadDTO): Promise<TrackerAIValidationDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const result = await this._trackerAIGateway.verifyTrackerSubtopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      subtopicTitle: input.subtopicTitle,
      subtopicDescription: input.subtopicDescription,
      difficulty: input.difficulty,
      existingSubtopics: input.existingSubtopics,
    });

    return this._trackerMapper.toTrackerAIValidationDto(result);
  }
}
