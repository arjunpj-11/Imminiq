import type { ActivityQueryRepositoryContract } from '../../domain/repositories/activity-query.repository.interface'
import type {
  ActivityPageResponse,
  GetActivityPagePayload,
} from '../dtos/activity.dto'
import { ActivityApplicationError } from '../errors/activity-application.error'
import type { ActivityMapperContract } from '../mappers/activity.mapper'
import type { ActivityAnalyticsServiceContract } from '../services/activity-analytics.service'
import type { ActivityDateRangeServiceContract } from '../services/activity-date-range.service'
import { GetActivityFeedUseCase } from './get-activity-feed.usecase'
import type { ClockContract } from '../../../../shared/time/clock.interface'

export class GetActivityPageUseCase {
  constructor(
    private readonly _activityRepository: ActivityQueryRepositoryContract,
    private readonly _feedUseCase: GetActivityFeedUseCase,
    private readonly _mapper: ActivityMapperContract,
    private readonly _analyticsService: ActivityAnalyticsServiceContract,
    private readonly _dateRangeService: ActivityDateRangeServiceContract,
    private readonly _clock: ClockContract,
  ) {}

  async execute(
    userId: string,
    payload: GetActivityPagePayload,
    now = this._clock.now(),
  ): Promise<ActivityPageResponse> {
    const context =
      this._dateRangeService.createContext(
        now,
        payload.year,
        payload.utcOffsetMinutes ?? 0,
      )

    const [analytics, feed] = await Promise.all([
      this._activityRepository.findActivityAnalytics({
        userId,
        year: context.year,
        yearRange: context.yearRange,
        currentWeekRange: context.currentWeekRange,
        previousWeekRange: context.previousWeekRange,
        todayRange: context.todayRange,
        todayKey: context.todayKey,
        yesterdayKey: context.yesterdayKey,
        timezone: context.timezone,
      }),

      this._feedUseCase.execute(
        userId,
        {
          ...(payload.filter !== undefined
            ? { filter: payload.filter }
            : {}),

          ...(payload.limit !== undefined
            ? { limit: payload.limit }
            : {}),

          ...(payload.cursor !== undefined
            ? { cursor: payload.cursor }
            : {}),

          ...(payload.utcOffsetMinutes !== undefined
            ? {
                utcOffsetMinutes:
                  payload.utcOffsetMinutes,
              }
            : {}),
        },
        now,
      ),
    ])

    if (!analytics.user) {
      throw ActivityApplicationError.userNotFound()
    }

    return this._mapper.toPageResponse({
      analytics,
      context,
      feed,
      analyticsService: this._analyticsService,
      dateRangeService: this._dateRangeService,
    })
  }
}
