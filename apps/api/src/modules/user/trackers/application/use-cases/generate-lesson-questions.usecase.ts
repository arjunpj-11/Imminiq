import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface';
import type { GenerateLessonQuestionsPayloadDTO } from '../tracker.dto';

type GenerateLessonQuestionsResultDTO = ReturnType<ITrackerMapper['toLessonGeneratedQuestionsDto']>;

export interface IGenerateLessonQuestionsUseCase {
  execute(input: GenerateLessonQuestionsPayloadDTO): Promise<GenerateLessonQuestionsResultDTO>;
}

export class GenerateLessonQuestionsUseCase implements IGenerateLessonQuestionsUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      | 'createLessonGeneratedQuestions'
      | 'findLessonBySubtopicId'
      | 'findOwnedTrackerById'
      | 'getLessonGeneratedQuestions'
    >,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(
    input: GenerateLessonQuestionsPayloadDTO
  ): Promise<GenerateLessonQuestionsResultDTO> {
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
        'Generate the lesson before generating questions'
      );
    }

    const generated = await this._trackerAIGateway.generateLessonPracticeQuestions({
      lessonTitle: lesson.title,
      lessonSummary: lesson.summary,
      lessonExplanation: lesson.explanation,
      count: input.count,
    });

    await this._trackerRepository.createLessonGeneratedQuestions({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: lesson._id.toString(),
      questions: generated.questions.map((question) => ({
        question,
        questionHash: this._questionHasher.hash(question),
        source: 'ai_generated',
      })),
    });

    const questions = await this._trackerRepository.getLessonGeneratedQuestions({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    });

    return this._trackerMapper.toLessonGeneratedQuestionsDto(questions);
  }
}
