import { z } from 'zod'
export const adminTrackerReviewsQuerySchema = z.object({ search: z.string().trim().max(120).optional(), status: z.string().trim().max(40).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) })
export const adminTrackerReviewStatusSchema = z.object({ status: z.enum(['approved', 'rejected']) })
