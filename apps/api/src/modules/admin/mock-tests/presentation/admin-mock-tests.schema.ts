import { z } from 'zod';
export const adminMockTestsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminMockTestLifecycleSchema = z.object({
  action: z.enum(['suspend', 'delete', 'restore']),
  reasonCode: z.enum([
    'incorrect_content',
    'unsafe_content',
    'copyright',
    'spam_or_abuse',
    'broken_assessment',
    'owner_request',
    'appeal_accepted',
    'other',
  ]),
  reason: z.string().trim().min(15).max(1000),
  notifyOwner: z.boolean().default(true),
});

export const adminMockTestQuestionIssueUpdateSchema = z.object({
  status: z.enum(['reviewing', 'resolved', 'dismissed']),
  resolutionAction: z
    .enum([
      'none',
      'question_corrected',
      'question_disabled',
      'test_suspended',
      'test_deleted',
    ])
    .optional()
    .default('none'),
  resolutionNote: z.string().trim().min(10).max(1500),
});
