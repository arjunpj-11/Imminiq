import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface'

type GetOptimizedSolutionInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  language?: string
}

export interface IGetOptimizedSolutionUseCase {
  execute(input: GetOptimizedSolutionInput): Promise<unknown>
}

export class GetOptimizedSolutionUseCase implements IGetOptimizedSolutionUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(input: GetOptimizedSolutionInput) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this._trackerRepository.findGeneratedLessonBySubtopic({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    const optimizedSolution =
      await this._trackerAIGateway.generateOptimizedCodeSolution({
        lessonTitle: lesson?.title || tracker.title || 'Coding lesson',
        practiceTitle: lesson?.practiceTask?.title || 'Coding practice',
        practiceDescription:
          lesson?.practiceTask?.description ||
          'Compare the user code with a cleaner and optimized solution.',
        sourceCode: input.sourceCode,
        language: input.language || lesson?.codeExample?.language || 'javascript',
      })

    return this._trackerMapper.toLessonOptimizedSolutionDto(optimizedSolution)
  }
}