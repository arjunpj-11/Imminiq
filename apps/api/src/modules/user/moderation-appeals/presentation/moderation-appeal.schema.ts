import { z } from 'zod'

const appealReasonSchema = z
  .string()
  .trim()
  .min(10, 'Appeal reason must be at least 10 characters')
  .max(2000, 'Appeal reason must not exceed 2000 characters')

export const submitModerationAppealSchema = z.object({
  appealReason: appealReasonSchema,
})

export const getModerationAppealStatusSchema = z.object({}).strict()

export type SubmitModerationAppealInput = z.infer<
  typeof submitModerationAppealSchema
>

export type GetModerationAppealStatusInput = z.infer<
  typeof getModerationAppealStatusSchema
>
