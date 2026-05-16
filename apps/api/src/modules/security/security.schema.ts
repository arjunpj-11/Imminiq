// apps/api/src/modules/security/security.schema.ts

import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must include at least one letter')
  .regex(/[0-9!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/, {
    message: 'Password must include at least one number or symbol',
  })

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .transform((value) => value.toLowerCase()),
})

export const verifyEmailChangeSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, 'Email verification token is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),

  newPassword: passwordSchema,
})

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', {
    error: 'Type DELETE to confirm account deletion',
  }),
})

export const verifyTwoFactorSetupSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit authenticator code'),
})

export const disableTwoFactorSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit authenticator code'),
})