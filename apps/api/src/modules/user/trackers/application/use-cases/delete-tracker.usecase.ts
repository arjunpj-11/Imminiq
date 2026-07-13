import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type DeleteTrackerResultDTO = ReturnType<ITrackerMapper['toTrackerDto']>

export interface IDeleteTrackerUseCase {
  execute(input: {
    trackerId: string
    userId: string
  }): Promise<DeleteTrackerResultDTO>
}

export class DeleteTrackerUseCase implements IDeleteTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'softDeleteOwnedTracker'>,
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
