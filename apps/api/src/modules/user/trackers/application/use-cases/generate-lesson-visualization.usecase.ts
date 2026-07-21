import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';
import type { GenerateLessonVisualizationPayloadDTO } from '../tracker.dto';

export interface IGenerateLessonVisualizationUseCase {
  execute(
    input: GenerateLessonVisualizationPayloadDTO
  ): Promise<ReturnType<ITrackerMapper['toLessonVisualizationDto']>>;
}

export class GenerateLessonVisualizationUseCase implements IGenerateLessonVisualizationUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      | 'findLessonBySubtopicId'
      | 'findLessonVisualization'
      | 'findOwnedTrackerById'
      | 'saveLessonVisualization'
    >,
    private readonly _trackerAIGateway: Pick<ITrackerAIGateway, 'generateLessonVisualization'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: GenerateLessonVisualizationPayloadDTO) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    if (!input.regenerate) {
      const cached = await this._trackerRepository.findLessonVisualization({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      });

      if (cached) {
        return this._trackerMapper.toLessonVisualizationDto(cached);
      }
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    });

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated('Generate the lesson before visualizing');
    }

    const result = await this._trackerAIGateway.generateLessonVisualization({
      title: lesson.title,
      summary: lesson.summary,
      explanation: lesson.explanation,
      lessonType: lesson.lessonType,
      tags: lesson.tags ?? [],
      difficulty: lesson.difficulty,
      codeExample: lesson.codeExample,
    });

    const savedVisualization = await this._trackerRepository.saveLessonVisualization({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: lesson._id.toString(),
      html: result.html,
      visualTitle: result.visualTitle,
      visualDescription: result.visualDescription,
    });

    return this._trackerMapper.toLessonVisualizationDto(savedVisualization);
  }
}
