import type {
  GetOptimizedSolutionPayloadDTO,
} from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type {
  ITrackerAIGateway,
  OptimizedCodeSolution,
} from '../../domain/services/tracker-ai.interface';

export interface IGetOptimizedSolutionUseCase {
  execute(input: GetOptimizedSolutionPayloadDTO): Promise<OptimizedCodeSolution>;
}

export class GetOptimizedSolutionUseCase implements IGetOptimizedSolutionUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'findGeneratedLessonBySubtopic' | 'findOwnedTrackerById'
    >,
    private readonly _trackerAIGateway: Pick<
      ITrackerAIGateway,
      'generateOptimizedCodeSolution'
    >,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: GetOptimizedSolutionPayloadDTO): Promise<OptimizedCodeSolution> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const lesson = await this._trackerRepository.findGeneratedLessonBySubtopic({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    });

    const optimizedSolution = await this._trackerAIGateway.generateOptimizedCodeSolution({
      lessonTitle: lesson?.title || tracker.title || 'Coding lesson',
      practiceTitle: lesson?.practiceTask?.title || 'Coding practice',
      practiceDescription:
        lesson?.practiceTask?.description ||
        'Compare the user code with a cleaner and optimized solution.',
      sourceCode: input.sourceCode,
      language: input.language || lesson?.codeExample?.language || 'javascript',
    });

    return this._trackerMapper.toLessonOptimizedSolutionDto(optimizedSolution);
  }
}
