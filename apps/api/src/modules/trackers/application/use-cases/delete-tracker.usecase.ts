import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

type DeleteTrackerResultDto = ReturnType<TrackerMapperContract['toTrackerDto']>

export class DeleteTrackerUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: {
    trackerId: string
    userId: string
  }): Promise<DeleteTrackerResultDto> {
    const tracker = await this.trackerRepository.softDeleteOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this.trackerMapper.toTrackerDto(tracker)
  }
}