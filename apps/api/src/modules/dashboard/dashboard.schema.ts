import { z } from 'zod'

export const dashboardRecentItemsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(20, 'Limit cannot exceed 20')
    .optional(),
})

export const dashboardActivityIntensityQuerySchema = z.object({
  months: z.coerce
    .number()
    .int()
    .min(1, 'Months must be at least 1')
    .max(12, 'Months cannot exceed 12')
    .optional(),
})

export type DashboardRecentItemsQuery = z.infer<
  typeof dashboardRecentItemsQuerySchema
>

export type DashboardActivityIntensityQuery = z.infer<
  typeof dashboardActivityIntensityQuerySchema
>
