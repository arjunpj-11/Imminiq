import { z } from 'zod'

import {
  ACTIVITY_DEFAULT_FEED_LIMIT,
  ACTIVITY_MAX_FEED_LIMIT,
  ACTIVITY_MAX_UTC_OFFSET_MINUTES,
  ACTIVITY_MIN_FEED_LIMIT,
  ACTIVITY_MIN_UTC_OFFSET_MINUTES,
  ACTIVITY_MIN_YEAR,
} from '../domain/constants/activity.constants'
import { ACTIVITY_FEED_FILTERS } from '../domain/value-objects/activity-category.vo'

const currentYear = new Date().getUTCFullYear()

const cursorSchema = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .optional()

const utcOffsetSchema = z.coerce
  .number()
  .int()
  .min(ACTIVITY_MIN_UTC_OFFSET_MINUTES)
  .max(ACTIVITY_MAX_UTC_OFFSET_MINUTES)
  .default(0)

const feedFields = {
  filter: z.enum(ACTIVITY_FEED_FILTERS).default('all'),

  limit: z.coerce
    .number()
    .int()
    .min(ACTIVITY_MIN_FEED_LIMIT)
    .max(ACTIVITY_MAX_FEED_LIMIT)
    .default(ACTIVITY_DEFAULT_FEED_LIMIT),

  cursor: cursorSchema,

  utcOffsetMinutes: utcOffsetSchema,
}

export const activityPageQuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(ACTIVITY_MIN_YEAR)
    .max(currentYear)
    .default(currentYear),

  ...feedFields,
})

export const activityFeedQuerySchema =
  z.object(feedFields)

export type ActivityPageQueryInput = z.infer<
  typeof activityPageQuerySchema
>

export type ActivityFeedQueryInput = z.infer<
  typeof activityFeedQuerySchema
>
