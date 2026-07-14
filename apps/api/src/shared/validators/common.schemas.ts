import { z } from 'zod';

export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
