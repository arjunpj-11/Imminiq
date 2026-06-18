import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

export class GetLessonCodeSubmissionsUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this.trackerRepository.getLessonCodeSubmissions(input)
  }
}
