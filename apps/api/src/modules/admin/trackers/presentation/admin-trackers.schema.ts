import { z } from 'zod';
import { paginationConfig } from '../../../../config/pagination';

export const adminContentAppealsQuerySchema = z.object({
  status: z
    .enum(['all', 'pending', 'under_review', 'approved', 'rejected'])
    .optional()
    .default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(paginationConfig.maxStandardLimit)
    .optional()
    .default(paginationConfig.defaultLimit),
});
export const adminContentAppealUpdateSchema = z.object({
  status: z.enum(['under_review', 'approved', 'rejected']),
  decisionNote: z.string().trim().min(10).max(3000),
});
export const adminTrackersQuerySchema = z.object({
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
export const adminTrackerBulkLifecycleSchema = adminTrackerLifecycleSchema.extend({
  ids: z
    .array(z.string().regex(/^[a-f\d]{24}$/i))
    .min(1)
    .max(100),
  preview: z.boolean().default(true),
});
export const adminTrackerVersionRestoreSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
});
export const adminTrackerVersionParamSchema = z.coerce.number().int().min(1).max(1_000_000);
export const adminTrackerReportUpdateSchema = z.object({
  status: z.enum(['reviewing', 'resolved', 'dismissed']),
  resolutionNote: z.string().trim().min(10).max(1500),
});
export const adminTrackerReviewStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});
export const adminTrackerReviewConsensusSchema = z.object({
  choice: z.enum(['pass', 'fail']),
});
