import { z } from 'zod';

export const adminContentAppealsQuerySchema = z.object({
  status: z.enum(['all', 'pending', 'under_review', 'approved', 'rejected']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export const adminContentAppealUpdateSchema = z.object({
  status: z.enum(['under_review', 'approved', 'rejected']),
  decisionNote: z.string().trim().min(10).max(3000),
});
export const adminMockTestsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminQuestionBankQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  topic: z.string().trim().max(200).optional(),
  type: z.enum(['all', 'mcq', 'short_answer', 'coding']).optional().default('all'),
  difficulty: z.enum(['all', 'easy', 'medium', 'hard']).optional().default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminQuestionBankDeleteSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
});

export const adminQuestionBankRestoreSchema = adminQuestionBankDeleteSchema;

export const adminQuestionBankIdSchema = z.coerce.number().int().positive();

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
export const adminMockTestBulkLifecycleSchema = adminMockTestLifecycleSchema.extend({ ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(100), preview: z.boolean().default(true) });

export const adminMockTestQuestionIssueUpdateSchema = z
  .object({
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
    correctedQuestion: z.string().trim().min(10).max(5000).optional(),
    correctedAnswer: z.string().trim().max(5000).optional(),
    correctedExplanation: z.string().trim().max(5000).optional(),
    correctedOptions: z.array(z.string().trim().min(1).max(1000)).min(2).max(10).optional(),
    correctedDifficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    correctedPoints: z.number().int().min(1).max(100).optional(),
    correctedCoding: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((value, context) => {
    if (value.status === 'reviewing' && value.resolutionAction !== 'none') {
      context.addIssue({
        code: 'custom',
        path: ['resolutionAction'],
        message: 'Content actions can only be applied when closing a report.',
      });
    }
    if (value.resolutionAction === 'question_corrected' && !value.correctedQuestion) {
      context.addIssue({
        code: 'custom',
        path: ['correctedQuestion'],
        message: 'Enter the corrected question text.',
      });
    }
    if (
      value.resolutionAction === 'question_corrected' &&
      value.correctedOptions?.length &&
      value.correctedAnswer &&
      !value.correctedOptions.includes(value.correctedAnswer)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['correctedAnswer'],
        message: 'The corrected answer must match one of the corrected options.',
      });
    }
  });

export const adminMockTestQuestionVersionRestoreSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
});
export const adminMockTestQuestionVersionParamSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(1_000_000);
