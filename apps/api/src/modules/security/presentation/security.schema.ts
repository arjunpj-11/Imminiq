import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must include at least one letter')
  .regex(/[0-9\W]/, {
    message: 'Password must include at least one number or symbol',
  })

const requiredPasswordSchema = z
  .string()
  .min(1, 'Current password is required')
  .max(128, 'Password is too long')

const optionalStepUpPasswordSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    return value.length > 0 ? value : undefined
  },
  requiredPasswordSchema.optional()
)

const twoFactorCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit authenticator code')

const optionalTwoFactorCodeSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? trimmedValue : undefined
  },
  twoFactorCodeSchema.optional()
)

const emailSchema = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .max(254, 'Email address is too long')
  .transform((value) => value.toLowerCase())

const tokenSchema = z
  .string()
  .trim()
  .min(1, 'Email verification token is required')
  .max(500, 'Email verification token is too long')

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  currentPassword: optionalStepUpPasswordSchema,
  twoFactorCode: optionalTwoFactorCodeSchema,
})

export const verifyEmailChangeSchema = z.object({
  token: tokenSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: requiredPasswordSchema,
  newPassword: passwordSchema,
})

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', {
    error: 'Type DELETE to confirm account deletion',
  }),
  currentPassword: optionalStepUpPasswordSchema,
  twoFactorCode: optionalTwoFactorCodeSchema,
})

export const verifyTwoFactorSetupSchema = z.object({
  token: twoFactorCodeSchema,
})

export const disableTwoFactorSchema = z.object({
  token: twoFactorCodeSchema,
})

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>

export type VerifyEmailChangeInput = z.infer<
  typeof verifyEmailChangeSchema
>

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

export type VerifyTwoFactorSetupInput = z.infer<
  typeof verifyTwoFactorSetupSchema
>

export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>