import type { LessonAnswerVerificationDTO, VerifyLessonAnswerPayloadDTO } from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';

const getIsCorrectFromResult = (result: {
  verdict?: 'correct' | 'partially_correct' | 'incorrect';
}) => {
  return result.verdict === 'correct';
};

export interface IVerifyLessonAnswerUseCase {
  execute(input: VerifyLessonAnswerPayloadDTO): Promise<LessonAnswerVerificationDTO>;
}

export class VerifyLessonAnswerUseCase implements IVerifyLessonAnswerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'createLessonAnswerAttempt' | 'findLessonBySubtopicId' | 'findOwnedTrackerById'
    >,
    private readonly _trackerAIGateway: Pick<ITrackerAIGateway, 'verifyNonCodingAnswer'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: VerifyLessonAnswerPayloadDTO): Promise<LessonAnswerVerificationDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    });

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before verifying answer'
      );
    }

    const practiceTask = lesson.practiceTask as
      | {
          expectedAnswer?: string;
        }
      | undefined;

    const result = await this._trackerAIGateway.verifyNonCodingAnswer({
      lessonTitle: lesson.title || tracker.title || 'Lesson practice',
      lessonExplanation:
        lesson.explanation ||
        'The learner is answering a practice question from this tracker lesson.',
      question: input.question,
      expectedAnswer: practiceTask?.expectedAnswer || '',
      userAnswer: input.answer,
    });

    const isCorrect = getIsCorrectFromResult(result);

    await this._trackerRepository.createLessonAnswerAttempt({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: lesson._id.toString(),
      question: input.question,
      answer: input.answer,
      feedback: result,
      isCorrect,
      score: typeof result.score === 'number' ? result.score : isCorrect ? 100 : 0,
    });

    return this._trackerMapper.toLessonAnswerVerificationDto(result);
  }
}
