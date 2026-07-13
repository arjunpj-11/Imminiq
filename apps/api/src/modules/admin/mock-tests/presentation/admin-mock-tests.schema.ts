import { z } from 'zod'
export const adminMockTestsQuerySchema = z.object({ search: z.string().trim().max(120).optional(), status: z.string().trim().max(40).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) })
