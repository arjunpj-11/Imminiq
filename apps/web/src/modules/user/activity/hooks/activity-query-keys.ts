import { ACTIVITY_QUERY_ROOT } from '../constants/activity.constants'
import type {
  IActivityFeedQueryInput,
  IActivityPageQueryInput,
} from '../types/activity.types'

export const activityQueryKeys = {
  all: [ACTIVITY_QUERY_ROOT] as const,
  pages: () => [...activityQueryKeys.all, 'page'] as const,
  page: (input: IActivityPageQueryInput) =>
    [
      ...activityQueryKeys.pages(),
      input.year,
      input.filter,
      input.limit,
      input.utcOffsetMinutes,
    ] as const,
  feeds: () => [...activityQueryKeys.all, 'feed'] as const,
  feed: (input: IActivityFeedQueryInput) =>
    [
      ...activityQueryKeys.feeds(),
      input.filter,
      input.limit,
      input.utcOffsetMinutes,
    ] as const,
}
