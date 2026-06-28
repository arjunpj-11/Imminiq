import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTrackerInput } from '../../domain/types/trackers.types'

type CreateTrackerResultDto = ReturnType<TrackerMapperContract['toTrackerDto']>

export class CreateTrackerUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: CreateTrackerInput): Promise<CreateTrackerResultDto> {
    const tracker = await this._trackerRepository.createTracker(input)

    return this._trackerMapper.toTrackerDto(tracker)
  }
}