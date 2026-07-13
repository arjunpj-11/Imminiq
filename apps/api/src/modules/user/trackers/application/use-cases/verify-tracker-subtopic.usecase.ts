import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';

type ExistingSubtopic = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
};

type VerifyTrackerSubtopicInput = {
  trackerId: string;
  topicId: string;
  userId: string;
  trackerTitle: string;
  topicTitle: string;
  topicDescription: string;
  subtopicTitle: string;
  subtopicDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  existingSubtopics: ExistingSubtopic[];
};

type VerifyTrackerSubtopicResultDTO = ReturnType<ITrackerMapper['toTrackerAIValidationDto']>;

export interface IVerifyTrackerSubtopicUseCase {
  execute(input: VerifyTrackerSubtopicInput): Promise<VerifyTrackerSubtopicResultDTO>;
}

export class VerifyTrackerSubtopicUseCase implements IVerifyTrackerSubtopicUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'findOwnedTrackerById'>,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: VerifyTrackerSubtopicInput): Promise<VerifyTrackerSubtopicResultDTO> {
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
