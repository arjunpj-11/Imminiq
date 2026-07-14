import { z } from 'zod';

export const adminSubscriptionsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z
    .enum(['all', 'pending', 'active', 'canceled', 'expired', 'replaced', 'failed'])
    .default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminPlanIdSchema = z.enum(['free', 'pro', 'premium']);
export const adminPlanLimitsSchema = z.object({
  maxTrackers: z.number().int().min(0).max(1_000),
  trackerGenerationsPerMonth: z.number().int().min(0).max(500),
  lessonGenerationsPerDay: z.number().int().min(0).max(500),
  mockTestGenerationsPerMonth: z.number().int().min(0).max(500),
  aiTutorRequestsPerDay: z.number().int().min(0).max(2_000),
});
