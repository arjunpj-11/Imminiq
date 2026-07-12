import type {
  GetActivityFeedPayloadDTO,
  GetActivityPagePayloadDTO,
  RecordUserActivityPayloadDTO,
} from './application/dtos/activity.dto'
import {
  createActivityComposition,
  type ActivityComposition,
} from './activity.factory'

export class ActivityService {
  private readonly _useCases:
    ActivityComposition['useCases']

  constructor(composition: ActivityComposition) {
    this._useCases = composition.useCases
  }

  getActivityPage(
    userId: string,
    payload: GetActivityPagePayloadDTO,
  ) {
    return this._useCases.getPage.execute(
      userId,
      payload,
    )
  }

  getActivityFeed(
    userId: string,
    payload: GetActivityFeedPayloadDTO,
  ) {
    return this._useCases.getFeed.execute(
      userId,
      payload,
    )
  }

  recordActivity(
    payload: RecordUserActivityPayloadDTO,
  ) {
    return this._useCases.recordActivity.execute(
      payload,
    )
  }
}

export type ActivityRecorderContract = Pick<
  ActivityService,
  'recordActivity'
>

export const activityService =
  new ActivityService(
    createActivityComposition(),
  )
