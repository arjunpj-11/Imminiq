import { z } from 'zod'
export const adminAnalyticsQuerySchema = z.object({ days: z.coerce.number().int().min(7).max(365).default(30) })
