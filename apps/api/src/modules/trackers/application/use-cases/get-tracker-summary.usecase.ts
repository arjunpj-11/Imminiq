import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import { ITrackerMapper } from '../mappers'

export interface IGetTrackerSummaryUseCase {
  execute(userId: string): Promise<import("../../domain").TrackerSummaryRecord>
}

export class GetTrackerSummaryUseCase implements IGetTrackerSummaryUseCase {
  constructor(private readonly _trackerRepository: ITrackerRepository,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(userId: string) {
    return this._trackerMapper.toTrackerSummaryDto(await this._trackerRepository.getTrackerSummary(userId))
  }
}
