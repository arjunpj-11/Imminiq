import { z } from 'zod'

const voteChoiceSchema = z.enum(['pass', 'fail'])

export const sendTrackerForVerificationSchema = z.object({
  requiredVotes: z.number().int().min(1).max(50).optional(),
  durationHours: z.number().int().min(1).max(168).optional(),
  urgent: z.boolean().optional(),
})

export const voteVerificationSubmissionSchema = z.object({
  vote: voteChoiceSchema,
  reason: z
    .string()
    .trim()
    .max(500, 'Reason must be at most 500 characters')
    .optional()
    .or(z.literal('')),
})

export type SendTrackerForVerificationInput = z.infer<
  typeof sendTrackerForVerificationSchema
>

export type VoteVerificationSubmissionInput = z.infer<
  typeof voteVerificationSubmissionSchema
>