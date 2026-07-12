import type { ActivityUseCases } from './application/contracts/activity-use-cases.contract'
import { ActivityMapper } from './application/mappers/activity.mapper'
import { ActivityEventPolicy } from './application/policies/activity-event.policy'
import { ActivityAnalytics } from './application/services/activity-analytics.service'
import { ActivityCursorCodec } from './application/services/activity-cursor.service'
import { ActivityDateRange } from './application/services/activity-date-range.service'
import { GetActivityFeedUseCase } from './application/use-cases/get-activity-feed.usecase'
import { GetActivityPageUseCase } from './application/use-cases/get-activity-page.usecase'
import { RecordUserActivityUseCase } from './application/use-cases/record-user-activity.usecase'
import { mongoActivityRepository } from './infrastructure/repositories/mongo-activity.repository'
import { systemClock } from '../../infrastructure/time/system-clock'


export type ActivityComposition = {
  useCases: ActivityUseCases
}

export const createActivityComposition =
  (): ActivityComposition => {
    const activityRepository =
      mongoActivityRepository

    const mapper = new ActivityMapper()
    const eventPolicy = new ActivityEventPolicy()
    const analyticsCalculator =
      new ActivityAnalytics()
    const cursorCodec =
      new ActivityCursorCodec()
    const dateRange =
      new ActivityDateRange()

    const getFeed = new GetActivityFeedUseCase(
      activityRepository,
      mapper,
      dateRange,
      cursorCodec,
      systemClock,
    )

    return {
      useCases: {
        getFeed,

        getPage: new GetActivityPageUseCase(
          activityRepository,
          getFeed,
          mapper,
          analyticsCalculator,
          dateRange,
          systemClock,
        ),

        recordActivity:
          new RecordUserActivityUseCase(
            activityRepository,
            eventPolicy,
            mapper,
            dateRange,
            systemClock,
          ),
      },
    }
  }
