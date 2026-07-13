import { z } from 'zod'

import {
  LEADERBOARD_DEFAULT_LIMIT,
  LEADERBOARD_MAX_LIMIT,
  LEADERBOARD_MIN_LIMIT,
} from '../domain/leaderboard.constants'
import { LEADERBOARD_SCOPES } from '../domain/value-objects/leaderboard-scope.vo'
import { LEADERBOARD_SECTIONS } from '../domain/value-objects/leaderboard-section.vo'

export const leaderboardQuerySchema = z.object({
  section: z.enum(LEADERBOARD_SECTIONS).default('students'),
  scope: z.enum(LEADERBOARD_SCOPES).default('global'),
  limit: z.coerce
    .number()
    .int()
    .min(LEADERBOARD_MIN_LIMIT)
    .max(LEADERBOARD_MAX_LIMIT)
    .default(LEADERBOARD_DEFAULT_LIMIT),
})

export type LeaderboardQueryInput = z.infer<
  typeof leaderboardQuerySchema
>
