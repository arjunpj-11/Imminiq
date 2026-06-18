import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

type GetOptimizedSolutionInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  language?: string
}

export class GetOptimizedSolutionUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerAIService: TrackerAIServiceContract
  ) {}

  async execute(input: GetOptimizedSolutionInput) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this.trackerRepository.findGeneratedLessonBySubtopic({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    return this.trackerAIService.generateOptimizedCodeSolution({
      lessonTitle: lesson?.title || tracker.title || 'Coding lesson',
      practiceTitle: lesson?.practiceTask?.title || 'Coding practice',
      practiceDescription:
        lesson?.practiceTask?.description ||
        'Compare the user code with a cleaner and optimized solution.',
      sourceCode: input.sourceCode,
      language:
        input.language ||
        lesson?.codeExample?.language ||
        'javascript',
    })
  }
}
