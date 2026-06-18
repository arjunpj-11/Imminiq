import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { QuestionHasherServiceContract } from '../../domain/services/question-hasher.service.interface'

export class GetLessonQuestionSolutionUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly questionHasher: QuestionHasherServiceContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this.trackerRepository.findLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash: this.questionHasher.hash(input.question),
    })
  }
}
