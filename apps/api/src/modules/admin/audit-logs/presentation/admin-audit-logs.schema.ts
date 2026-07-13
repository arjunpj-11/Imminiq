import { z } from 'zod'
export const adminAuditLogsQuerySchema = z.object({ search: z.string().trim().max(120).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25), status: z.string().optional() })
