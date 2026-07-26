import { z } from 'zod';
import { paginationConfig } from '../../../../config/pagination';
import { createHttpUrlSchema } from '../../../../shared/validators/common.schemas';

export const adminUsersQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  status: z
    .enum(['all', 'active', 'paused', 'blocked', 'deactivated', 'banned'])
    .optional()
    .default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(paginationConfig.maxStandardLimit)
    .optional()
    .default(paginationConfig.profileLimit),
});
export const adminUserStatusSchema = z.object({
  status: z.enum(['active', 'paused', 'blocked']),
  reasonCode: z.enum([
    'policy_violation',
    'security_risk',
    'spam_or_abuse',
    'payment_or_fraud',
    'appeal_accepted',
    'other',
  ]),
  reason: z.string().trim().min(15).max(1000),
  notifyEmail: z.boolean().default(true),
});

export const adminUserMessageSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(3000),
  notifyEmail: z.boolean().default(true),
});

export const adminUserAppealsQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
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
    .default(paginationConfig.profileLimit),
});

export const adminUserAppealUpdateSchema = z.object({
  status: z.enum(['under_review', 'approved', 'rejected']),
  reviewNote: z.string().trim().min(10).max(2000),
  notifyEmail: z.boolean().default(true),
});
export const adminUserRoleSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
  reason: z.string().trim().min(10).max(1000),
});

export const adminActionPasswordSchema = z.object({
  password: z
    .string()
    .min(10, 'Use at least 10 characters')
    .max(128, 'Use no more than 128 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/\d/, 'Include at least one number'),
});

export const adminPrivacyRequestsQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  status: z
    .enum(['all', 'pending', 'in_progress', 'completed', 'rejected', 'cancelled'])
    .optional()
    .default('all'),
  type: z.enum(['all', 'access', 'export', 'delete', 'correction']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(paginationConfig.maxStandardLimit)
    .optional()
    .default(paginationConfig.defaultLimit),
});

export const adminPrivacyRequestUpdateSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'rejected']),
  resolutionNote: z.string().trim().min(10).max(3000),
  downloadUrl: createHttpUrlSchema().optional(),
});
export const adminUserNoteSchema = z.object({
  note: z.string().trim().min(3).max(3000),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
});
export const adminUserTagsSchema = z.object({
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(20),
});
export const adminUserBulkStatusSchema = adminUserStatusSchema.extend({
  userIds: z
    .array(z.string().regex(/^[a-f\d]{24}$/i))
    .min(1)
    .max(100),
  preview: z.boolean().default(true),
});
