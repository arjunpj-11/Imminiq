// apps/api/src/modules/trackers/application/use-cases/publish-tracker.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { PublishTrackerInput } from '../../domain/trackers.types'
import { ITrackerMapper } from '..'

export interface IPublishTrackerUseCase {
  execute(input: PublishTrackerInput): Promise<import("../../domain/value-objects/tracker-record.vo").TrackerRecord>
}

export class PublishTrackerUseCase implements IPublishTrackerUseCase {
  constructor(private readonly _trackerRepository: ITrackerRepository,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(input: PublishTrackerInput) {
  
    const tracker = await this._trackerRepository.publishOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}