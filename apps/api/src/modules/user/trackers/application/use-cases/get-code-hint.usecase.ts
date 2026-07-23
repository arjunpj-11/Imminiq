import type { GetCodeHintPayloadDTO, LessonCodeHintDTO } from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';

export interface IGetCodeHintUseCase {
  execute(input: GetCodeHintPayloadDTO): Promise<LessonCodeHintDTO>;
}

export class GetCodeHintUseCase implements IGetCodeHintUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'findGeneratedLessonBySubtopic' | 'findOwnedTrackerById'
    >,
    private readonly _trackerAIGateway: Pick<ITrackerAIGateway, 'generateCodeHint'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: GetCodeHintPayloadDTO): Promise<LessonCodeHintDTO> {
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

    const aiResult = await this._trackerAIGateway.generateCodeHint({
      lessonTitle: lesson?.title || tracker.title || 'Coding lesson',
      practiceTitle: lesson?.practiceTask?.title || 'Coding practice',
      practiceDescription:
        lesson?.practiceTask?.description || 'Find the issue in the submitted code.',
      expectedOutput: lesson?.practiceTask?.expectedOutput || '',
      sourceCode: input.sourceCode,
      actualOutput: input.actualOutput,
      errorOutput: input.errorOutput,
      hintCount: input.hintCount,
    });

    return this._trackerMapper.toLessonCodeHintDto({
      mode: aiResult.mode,
      hintCount: input.hintCount + 1,
      title: aiResult.title,
      explanation: aiResult.explanation,
    });
  }
}
