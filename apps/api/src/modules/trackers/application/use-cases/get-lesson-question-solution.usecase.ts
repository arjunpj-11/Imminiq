import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { QuestionHasherServiceContract } from '../../domain/services/question-hasher.service.interface'

export class GetLessonQuestionSolutionUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly questionHasher: QuestionHasherServiceContract,
    private readonly trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const solution = await this.trackerRepository.findLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash: this.questionHasher.hash(input.question),
    })

    return this.trackerMapper.toLessonQuestionSolutionDto(solution)
  }
}