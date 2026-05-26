import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-zA-Z]/, 'Must include at least one letter')
  .regex(/[0-9\W]/, 'Must include a number or symbol')

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Email or phone number is required')
  .refine((value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const phoneRegex = /^[+\d][\d\s\-()]{6,}$/

    return emailRegex.test(value) || phoneRegex.test(value)
  }, 'Enter a valid email address or phone number')

const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'OTP must be 6 digits')

const twoFactorLoginCodeSchema = z
  .string()
  .trim()
  .min(1, 'Two-factor code is required')
  .max(32, 'Two-factor code is too long')
  .refine((value) => {
    const compact = value.replace(/\s/g, '')

    const isTotp = /^\d{6}$/.test(compact)
    const isBackupCode = /^[A-Fa-f0-9]{5}-?[A-Fa-f0-9]{5}$/.test(compact)

    return isTotp || isBackupCode
  }, 'Enter a valid 6-digit authenticator code or backup code')

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(80, 'Name is too long')
    .regex(/[a-zA-Z]/, 'Name must contain letters'),

  identifier: identifierSchema,

  password: passwordSchema,
})

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required'),
})

export const verifyTwoFactorLoginSchema = z.object({
  code: twoFactorLoginCodeSchema,
})

export const forgotPasswordSchema = z.object({
  identifier: identifierSchema,
})

export const verifyResetCodeSchema = z.object({
  identifier: identifierSchema,
  otp: otpSchema,
})

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

export const verifyOtpSchema = z.object({
  identifier: identifierSchema,
  otp: otpSchema,
})

export const sendOtpSchema = z.object({
  identifier: identifierSchema,
  purpose: z.enum([
    'email_verification',
    'phone_verification',
    'password_reset',
  ]),
})

export const checkIdentifierSchema = z.object({
  identifier: identifierSchema,
})

/**
 * Keep this endpoint/schema.
 * Username is no longer entered during registration,
 * but this will still be useful later when the user edits their username.
 */
export const checkUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, underscore'
    ),
})
