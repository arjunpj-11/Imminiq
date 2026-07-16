import { z } from 'zod';

const appealReasonSchema = z
  .string()
  .trim()
  .min(10, 'Appeal reason must be at least 10 characters')
  .max(2000, 'Appeal reason must not exceed 2000 characters');

export const submitModerationAppealSchema = z.object({
  appealReason: appealReasonSchema,
});

export const getModerationAppealStatusSchema = z.object({}).strict();

export const submitContentModerationAppealSchema = z.object({
  targetType: z.enum(['tracker', 'mock_test']),
  targetId: z.string().trim().min(1).max(100),
  reason: z.string().trim().min(20).max(3000),
  evidenceUrls: z.array(z.string().url().max(2000)).max(10).default([]),
});

export type SubmitModerationAppealInput = z.infer<typeof submitModerationAppealSchema>;

export type GetModerationAppealStatusInput = z.infer<typeof getModerationAppealStatusSchema>;
