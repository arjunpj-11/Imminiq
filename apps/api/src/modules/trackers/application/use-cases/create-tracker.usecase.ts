import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTrackerInput } from '../../domain/types/trackers.types'

type CreateTrackerResultDto = ReturnType<TrackerMapperContract['toTrackerDto']>

export class CreateTrackerUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: CreateTrackerInput): Promise<CreateTrackerResultDto> {
    const tracker = await this.trackerRepository.createTracker(input)

    return this.trackerMapper.toTrackerDto(tracker)
  }
}