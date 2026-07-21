import { z } from 'zod';

export const adminJobWorklistQuerySchema = z.object({
  queue: z.enum(['all', 'ai', 'email', 'notification', 'analytics', 'streak']).default('all'),
  status: z.enum(['all', 'waiting', 'active', 'delayed', 'completed', 'failed']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const adminJobActionSchema = z.object({
  action: z.enum(['cancel', 'retry', 'remove']),
});
