import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerMapper } from '../mappers/tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type DeleteTrackerResultDTO = ReturnType<ITrackerMapper['toTrackerDto']>

export class DeleteTrackerUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: {
    trackerId: string
    userId: string
  }): Promise<DeleteTrackerResultDTO> {
    const tracker = await this._trackerRepository.softDeleteOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}