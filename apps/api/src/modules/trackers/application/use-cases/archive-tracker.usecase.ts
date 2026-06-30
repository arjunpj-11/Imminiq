import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

type ArchiveTrackerResultDto = ReturnType<TrackerMapperContract['toTrackerDto']>

export class ArchiveTrackerUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: {
    trackerId: string
    userId: string
  }): Promise<ArchiveTrackerResultDto> {
    const tracker = await this._trackerRepository.archiveOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}