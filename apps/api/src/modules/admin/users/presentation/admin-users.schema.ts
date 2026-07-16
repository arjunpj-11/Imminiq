import { z } from 'zod';

export const adminUsersQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  status: z.enum(['all', 'active', 'blocked']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
export const adminUserStatusSchema = z.object({
  status: z.enum(['active', 'blocked']),
  reason: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  if (value.status === 'blocked' && (!value.reason || value.reason.length < 10)) {
    context.addIssue({ code: 'custom', path: ['reason'], message: 'A clear blocking reason is required' });
  }
});
