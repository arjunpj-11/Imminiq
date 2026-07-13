import { z } from 'zod';
export const createSupportTicketSchema = z.object({
  subject: z.string().trim().min(5).max(160),
  description: z.string().trim().min(20).max(3000),
  category: z.enum(['account', 'learning', 'technical', 'billing', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});
