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

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(80, 'Name is too long')
    .regex(/[a-zA-Z]/, 'Name must contain letters'),

  identifier: identifierSchema,

  password: passwordSchema,

  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, underscore'
    )
    .optional(),
})

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required'),
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