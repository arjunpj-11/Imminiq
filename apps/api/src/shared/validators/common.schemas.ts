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

export const createHttpUrlSchema = (maxLength = 2_048) =>
  z
    .string()
    .trim()
    .max(maxLength, `URL must not exceed ${maxLength} characters`)
    .url('Must be a valid URL')
    .refine((value) => {
      const parsed = new URL(value);
      return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password;
    }, 'URL must use HTTP or HTTPS and must not contain credentials');
