import { z } from 'zod';
export const adminBroadcastsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});
export const adminBroadcastSchema = z.object({
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(3).max(500),
  audience: z.enum(['all', 'active', 'free', 'pro', 'premium', 'custom']).default('all'),
  userIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(50).optional(),
  deepLink: z.string().trim().regex(/^\/(?!\/)/, 'Use an internal application path').max(300).optional(),
  poll: z
    .object({
      question: z.string().trim().min(3).max(180),
      options: z.array(z.string().trim().min(1).max(100)).min(2).max(4),
    })
    .optional(),
}).superRefine((value, context) => {
  if (value.audience === 'custom' && !value.userIds?.length) {
    context.addIssue({ code: 'custom', path: ['userIds'], message: 'Select at least one recipient' });
  }
});
