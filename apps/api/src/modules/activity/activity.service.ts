import type {
  GetActivityFeedPayload,
  GetActivityPagePayload,
  RecordUserActivityPayload,
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
    payload: GetActivityPagePayload,
  ) {
    return this._useCases.getPage.execute(
      userId,
      payload,
    )
  }

  getActivityFeed(
    userId: string,
    payload: GetActivityFeedPayload,
  ) {
    return this._useCases.getFeed.execute(
      userId,
      payload,
    )
  }

  recordActivity(
    payload: RecordUserActivityPayload,
  ) {
    return this._useCases.recordActivity.execute(
      payload,
    )
  }
}

export const activityService =
  new ActivityService(
    createActivityComposition(),
  )
