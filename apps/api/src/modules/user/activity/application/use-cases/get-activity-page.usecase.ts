import type { IActivityQueryRepository } from '../../domain/repositories/activity-query.repository.interface';
import type { ActivityPageResponseDTO, GetActivityPagePayloadDTO } from '../activity.dto';
import { ActivityApplicationError } from '../activity-application.error';
import type { ActivityMapperContract } from '../activity.mapper';
import type { ActivityAnalyticsContract } from '../services/activity-analytics.service';
import type { ActivityDateRangeContract } from '../services/activity-date-range.service';
import { GetActivityFeedUseCase } from './get-activity-feed.usecase';
import type { IClock } from '../../../../../shared/time/clock.interface';
import type { IActivityPolicyReader } from '../../../../../shared/platform-policy';

export interface IGetActivityPageUseCase {
  execute(
    userId: string,
    payload: GetActivityPagePayloadDTO,
    now?: Date
  ): Promise<ActivityPageResponseDTO>;
}

export class GetActivityPageUseCase implements IGetActivityPageUseCase {
  constructor(
    private readonly _activityRepository: IActivityQueryRepository,
    private readonly _feedUseCase: GetActivityFeedUseCase,
    private readonly _mapper: ActivityMapperContract,
    private readonly _analyticsCalculator: ActivityAnalyticsContract,
    private readonly _dateRange: ActivityDateRangeContract,
    private readonly _clock: IClock,
    private readonly _policyReader: IActivityPolicyReader
  ) {}

  async execute(
    userId: string,
    payload: GetActivityPagePayloadDTO,
    now = this._clock.now()
  ): Promise<ActivityPageResponseDTO> {
    const context = this._dateRange.createContext(now, payload.year, payload.utcOffsetMinutes ?? 0);

    const [analytics, feed, policy] = await Promise.all([
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
          ...(payload.filter !== undefined ? { filter: payload.filter } : {}),

          ...(payload.limit !== undefined ? { limit: payload.limit } : {}),

          ...(payload.cursor !== undefined ? { cursor: payload.cursor } : {}),

          ...(payload.utcOffsetMinutes !== undefined
            ? {
                utcOffsetMinutes: payload.utcOffsetMinutes,
              }
            : {}),
        },
        now
      ),
      this._policyReader.getActivityPolicy(),
    ]);

    if (!analytics.user) {
      throw ActivityApplicationError.userNotFound();
    }

    return this._mapper.toPageResponse({
      analytics,
      context,
      feed,
      analyticsCalculator: this._analyticsCalculator,
      dateRange: this._dateRange,
      policy,
    });
  }
}
