import { z } from 'zod'
export const adminBroadcastsQuerySchema = z.object({ search: z.string().trim().max(120).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() })
export const adminBroadcastSchema = z.object({ title: z.string().trim().min(3).max(120), message: z.string().trim().min(3).max(500), audience: z.enum(['all', 'active']).default('all'), deepLink: z.string().trim().max(300).optional() })
