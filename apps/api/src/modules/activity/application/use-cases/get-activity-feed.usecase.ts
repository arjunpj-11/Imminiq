import {
  ACTIVITY_DEFAULT_FEED_LIMIT,
  ACTIVITY_MAX_FEED_LIMIT,
  ACTIVITY_MIN_FEED_LIMIT,
} from '../../domain/constants/activity.constants'
import type { ActivityQueryRepositoryContract } from '../../domain/repositories/activity-query.repository.interface'
import { activityCategoriesForFilter } from '../../domain/value-objects/activity-category.vo'
import type {
  ActivityFeedResponse,
  GetActivityFeedPayload,
} from '../dtos/activity.dto'
import type { ActivityCursorCodecContract } from '../services/activity-cursor.service'
import type { ActivityDateRangeContract } from '../services/activity-date-range.service'
import type { ActivityMapperContract } from '../mappers/activity.mapper'
import type { ClockContract } from '../../../../shared/time/clock.interface'

export class GetActivityFeedUseCase {
  constructor(
    private readonly _activityRepository: ActivityQueryRepositoryContract,
    private readonly _mapper: ActivityMapperContract,
    private readonly _dateRange: ActivityDateRangeContract,
    private readonly _cursorCodec: ActivityCursorCodecContract,
    private readonly _clock: ClockContract,
  ) {}

  async execute(
    userId: string,
    payload: GetActivityFeedPayload,
    now = this._clock.now(),
  ): Promise<ActivityFeedResponse> {
    const filter = payload.filter ?? 'all'
    const limit = this.normalizeLimit(payload.limit)
    const cursor = this._cursorCodec.decode(payload.cursor)
    const categories = activityCategoriesForFilter(filter)

    const context =
      this._dateRange.createContext(
        now,
        undefined,
        payload.utcOffsetMinutes ?? 0,
      )

    const result =
      await this._activityRepository.findActivityFeed({
        userId,

        ...(categories !== undefined
          ? { categories }
          : {}),

        limit,

        ...(cursor
          ? {
              beforeOccurredAt: cursor.occurredAt,
              beforeId: cursor.id,
            }
          : {}),
      })

    const lastActivity =
      result.activities[result.activities.length - 1]

    return {
      filter,

      groups: this._mapper.toGroupedFeed(
        result.activities,
        context,
        this._dateRange,
      ),

      pagination: {
        limit,
        returned: result.activities.length,
        hasMore: result.hasMore,

        nextCursor:
          result.hasMore && lastActivity
            ? this._cursorCodec.encode({
                occurredAt: lastActivity.occurredAt,
                id: lastActivity.id,
              })
            : null,
      },
    }
  }

  private normalizeLimit(limit?: number): number {
    const value = limit ?? ACTIVITY_DEFAULT_FEED_LIMIT

    return Math.min(
      ACTIVITY_MAX_FEED_LIMIT,
      Math.max(ACTIVITY_MIN_FEED_LIMIT, value),
    )
  }
}
