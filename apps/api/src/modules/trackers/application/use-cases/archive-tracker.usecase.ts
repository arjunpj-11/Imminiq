import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type ArchiveTrackerResultDTO = ReturnType<ITrackerMapper['toTrackerDto']>

export interface IArchiveTrackerUseCase {
  execute(input: {
    trackerId: string
    userId: string
  }): Promise<ArchiveTrackerResultDTO>
}

export class ArchiveTrackerUseCase implements IArchiveTrackerUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: {
    trackerId: string
    userId: string
  }): Promise<ArchiveTrackerResultDTO> {
    const tracker = await this._trackerRepository.archiveOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}