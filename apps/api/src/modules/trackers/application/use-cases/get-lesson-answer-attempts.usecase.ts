import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import { TrackerMapperContract } from '../mappers'

export class GetLessonAnswerAttemptsUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract, private readonly trackerMapper: TrackerMapperContract) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const attempts = await this.trackerRepository.getLessonAnswerAttempts(input)
    return this.trackerMapper.toLessonAnswerAttemptsDto(attempts)
  }
}
