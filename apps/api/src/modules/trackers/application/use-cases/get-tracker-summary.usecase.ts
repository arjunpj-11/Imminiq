import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import { TrackerMapperContract } from '../mappers'

export class GetTrackerSummaryUseCase {
  constructor(private readonly _trackerRepository: TrackerRepositoryContract,private readonly _trackerMapper: TrackerMapperContract) {}

  async execute(userId: string) {
    return this._trackerMapper.toTrackerSummaryDto(await this._trackerRepository.getTrackerSummary(userId))
  }
}
