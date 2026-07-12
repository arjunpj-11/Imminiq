import { z } from 'zod'

const voteChoiceSchema = z.enum(['pass', 'fail'])

const paginationQueryFields = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
}

export const communityTrackerQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  topics: z.union([z.string().max(500), z.array(z.string().max(120)).max(20)]).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verifiedOnly: z.enum(['true', 'false']).optional(),
  sort: z.enum(['top-rated', 'most-cloned', 'newest']).optional(),
  ...paginationQueryFields,
})

export const communityPaginationQuerySchema = z.object(paginationQueryFields)

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

export const upsertCommunityTrackerReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(2, 'Review comment must be at least 2 characters')
    .max(1200, 'Review comment must be at most 1200 characters'),
})

export type VoteVerificationSubmissionInput = z.infer<
  typeof voteVerificationSubmissionSchema
>

export type UpsertCommunityTrackerReviewInput = z.infer<
  typeof upsertCommunityTrackerReviewSchema
>

export type SendTrackerForVerificationInput = z.infer<
  typeof sendTrackerForVerificationSchema
>
