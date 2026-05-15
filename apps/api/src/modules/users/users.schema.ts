import { z } from 'zod'

const optionalCleanString = (max: number) =>
  z.string().trim().max(max).optional()

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .max(300)
  .optional()
  .or(z.literal(''))

export const updateMyProfileSchema = z
  .object({
    fullName: optionalCleanString(120),
    headline: optionalCleanString(160),
    bio: optionalCleanString(1200),
    location: optionalCleanString(180),
    education: optionalCleanString(220),

    skills: z
      .array(z.string().trim().min(1).max(40))
      .max(24)
      .optional(),

    interests: z
      .array(z.string().trim().min(1).max(40))
      .max(24)
      .optional(),

    githubUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    portfolioUrl: optionalUrl,

    publicProfileEnabled: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one profile field is required',
  })