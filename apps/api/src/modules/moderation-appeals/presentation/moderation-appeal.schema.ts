import { z } from 'zod'

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Email or phone number is required')
  .max(120, 'Identifier is too long')

const appealReasonSchema = z
  .string()
  .trim()
  .min(10, 'Appeal reason must be at least 10 characters')
  .max(2000, 'Appeal reason must not exceed 2000 characters')

export const submitModerationAppealSchema = z.object({
  identifier: identifierSchema,
  appealReason: appealReasonSchema,
})

export const getModerationAppealStatusSchema = z.object({
  identifier: identifierSchema,
})

export type SubmitModerationAppealInput = z.infer<
  typeof submitModerationAppealSchema
>

export type GetModerationAppealStatusInput = z.infer<
  typeof getModerationAppealStatusSchema
>
