import { z } from 'zod';
export const adminTrackersQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const adminPublishedTrackerRatingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
});
export const adminTrackerLifecycleSchema = z.object({
  action: z.enum(['suspend', 'delete', 'restore']),
  reasonCode: z.enum([
    'incorrect_content',
    'unsafe_content',
    'copyright',
    'spam_or_abuse',
    'broken_learning_path',
    'owner_request',
    'appeal_accepted',
    'other',
  ]),
  reason: z.string().trim().min(15).max(1000),
  notifyOwner: z.boolean().default(true),
});
export const adminTrackerReportUpdateSchema = z.object({
  status: z.enum(['reviewing', 'resolved', 'dismissed']),
  resolutionNote: z.string().trim().min(10).max(1500),
});
