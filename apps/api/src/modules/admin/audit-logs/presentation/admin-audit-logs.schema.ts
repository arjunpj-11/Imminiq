import { z } from 'zod';
import { paginationConfig } from '../../../../config/pagination';

export const adminAuditLogsQuerySchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(paginationConfig.maxLimit)
      .default(paginationConfig.adminLimit),
    status: z.string().optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
  })
  .refine((input) => !input.from || !input.to || input.from <= input.to, {
    message: 'The start date must be on or before the end date',
    path: ['to'],
  });
