import { ActivityMapper } from './application/mappers/activity.mapper'
import { ActivityEventPolicy } from './application/policies/activity-event.policy'
import { ActivityAnalyticsService } from './application/services/activity-analytics.service'
import { ActivityCursorService } from './application/services/activity-cursor.service'
import { ActivityDateRangeService } from './application/services/activity-date-range.service'
import { GetActivityFeedUseCase } from './application/use-cases/get-activity-feed.usecase'
import { GetActivityPageUseCase } from './application/use-cases/get-activity-page.usecase'
import { RecordUserActivityUseCase } from './application/use-cases/record-user-activity.usecase'
import { mongoActivityRepository } from './infrastructure/repositories/mongo-activity.repository'

export type ActivityUseCases = {
  getPage: GetActivityPageUseCase
  getFeed: GetActivityFeedUseCase
  recordActivity: RecordUserActivityUseCase
}

export type ActivityComposition = {
  useCases: ActivityUseCases
}

export const createActivityComposition =
  (): ActivityComposition => {
    const activityRepository =
      mongoActivityRepository

    const mapper = new ActivityMapper()
    const eventPolicy = new ActivityEventPolicy()
    const analyticsService =
      new ActivityAnalyticsService()
    const cursorService =
      new ActivityCursorService()
    const dateRangeService =
      new ActivityDateRangeService()

    const getFeed = new GetActivityFeedUseCase(
      activityRepository,
      mapper,
      dateRangeService,
      cursorService,
    )

    return {
      useCases: {
        getFeed,

        getPage: new GetActivityPageUseCase(
          activityRepository,
          getFeed,
          mapper,
          analyticsService,
          dateRangeService,
        ),

        recordActivity:
          new RecordUserActivityUseCase(
            activityRepository,
            eventPolicy,
            mapper,
            dateRangeService,
          ),
      },
    }
  }
