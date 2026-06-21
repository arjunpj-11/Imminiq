import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import { TrackerMapperContract } from '../mappers'

export class GetLessonGeneratedQuestionsUseCase {
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

    const generatedQuestions = await this.trackerRepository.getLessonGeneratedQuestions(input)
    return this.trackerMapper.toLessonGeneratedQuestionsDto(generatedQuestions)
  }
}
