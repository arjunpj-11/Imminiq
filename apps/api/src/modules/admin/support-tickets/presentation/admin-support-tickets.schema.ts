import { z } from 'zod';
import { paginationConfig } from '../../../../config/pagination';

export const adminSupportTicketsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(paginationConfig.maxLimit)
    .default(paginationConfig.defaultLimit),
});
export const adminSupportTicketUpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  resolutionNote: z.string().trim().max(2000).optional(),
  notificationMessage: z.string().trim().max(500).optional(),
});
