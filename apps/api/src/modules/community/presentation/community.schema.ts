import { z } from 'zod'

const voteChoiceSchema = z.enum(['pass', 'fail'])

export const voteVerificationSubmissionSchema = z.object({
  vote: voteChoiceSchema,
  reason: z
    .string()
    .trim()
    .max(500, 'Reason must be at most 500 characters')
    .optional()
    .or(z.literal('')),
})

export type VoteVerificationSubmissionInput = z.infer<
  typeof voteVerificationSubmissionSchema
>
