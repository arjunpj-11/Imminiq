import { z } from 'zod'

export const submitModerationAppealSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or phone number is required')
    .max(120, 'Identifier is too long'),

  appealReason: z
    .string()
    .trim()
    .min(10, 'Appeal reason must be at least 10 characters')
    .max(2000, 'Appeal reason must not exceed 2000 characters'),
})

export type SubmitModerationAppealPayload = z.infer<
  typeof submitModerationAppealSchema
>

export const getModerationAppealStatusSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or phone number is required')
    .max(120, 'Identifier is too long'),
})

export type GetModerationAppealStatusPayload = z.infer<
  typeof getModerationAppealStatusSchema
>
