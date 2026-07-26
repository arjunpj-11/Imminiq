import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface';
import type { LessonQuestionPayloadDTO, LessonQuestionSolutionDTO } from '../tracker.dto';

export interface IGenerateLessonQuestionSolutionUseCase {
  execute(input: LessonQuestionPayloadDTO): Promise<LessonQuestionSolutionDTO>;
}

export class GenerateLessonQuestionSolutionUseCase implements IGenerateLessonQuestionSolutionUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      | 'createLessonQuestionSolution'
      | 'findLessonBySubtopicId'
      | 'findLessonQuestionSolution'
      | 'findOwnedTrackerById'
    >,
    private readonly _trackerAIGateway: Pick<ITrackerAIGateway, 'generateLessonQuestionSolution'>,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: LessonQuestionPayloadDTO): Promise<LessonQuestionSolutionDTO> {
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
        'Generate the lesson before generating solution'
      );
    }

    const questionHash = this._questionHasher.hash(input.question);

    const existing = await this._trackerRepository.findLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash,
    });

    if (existing) {
      return this._trackerMapper.toLessonQuestionSolutionDto(existing);
    }

    const solution = await this._trackerAIGateway.generateLessonQuestionSolution({
      lessonTitle: lesson.title,
      lessonExplanation: lesson.explanation,
      question: input.question,
    });

    const createdSolution = await this._trackerRepository.createLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: lesson._id.toString(),
      question: input.question,
      questionHash,
      solution,
    });

    return this._trackerMapper.toLessonQuestionSolutionDto(createdSolution);
  }
}
