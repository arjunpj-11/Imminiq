import { z } from 'zod';
import { paginationConfig } from '../../../../config/pagination';

export const adminJobWorklistQuerySchema = z.object({
  queue: z.enum(['all', 'ai', 'email', 'notification', 'analytics', 'streak']).default('all'),
  status: z.enum(['all', 'waiting', 'active', 'delayed', 'completed', 'failed']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(paginationConfig.maxLimit)
    .default(paginationConfig.adminLimit),
});

export const adminJobActionSchema = z.object({
  action: z.enum(['cancel', 'retry', 'remove']),
});
