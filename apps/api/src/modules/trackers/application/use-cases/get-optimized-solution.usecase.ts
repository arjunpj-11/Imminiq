import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIGatewayContract } from '../../domain/services/tracker-ai.interface'

type GetOptimizedSolutionInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  language?: string
}

export class GetOptimizedSolutionUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerAIGateway: TrackerAIGatewayContract,
    private readonly _trackerMapper: TrackerMapperContract,
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