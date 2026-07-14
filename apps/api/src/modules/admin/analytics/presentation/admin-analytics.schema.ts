import { z } from 'zod';
export const adminAnalyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
}).refine((input) => !input.from || !input.to || input.from <= input.to, {
  message: 'The start date must be on or before the end date',
  path: ['to'],
});
