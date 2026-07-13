import { z } from 'zod'

const optionalCleanStringSchema = (
  maxLength: number,
  maxMessage: string
) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value
      }

      const trimmedValue = value.trim()

      return trimmedValue.length > 0 ? trimmedValue : undefined
    },
    z.string().max(maxLength, maxMessage).optional()
  )

const optionalUrlSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? trimmedValue : undefined
  },
  z
    .string()
    .url('Must be a valid URL')
    .max(300, 'URL must not exceed 300 characters')
    .optional()
)

const profileTagSchema = z.string().trim().min(1).max(40)

const hasAtLeastOneDefinedValue = (payload: Record<string, unknown>) =>
  Object.values(payload).some((value) => value !== undefined)

export const updateMyProfileSchema = z
  .object({
    fullName: optionalCleanStringSchema(120, 'Full name is too long'),
    headline: optionalCleanStringSchema(160, 'Headline is too long'),
    bio: optionalCleanStringSchema(1200, 'Bio is too long'),
    location: optionalCleanStringSchema(180, 'Location is too long'),
    education: optionalCleanStringSchema(220, 'Education is too long'),
    skills: z.array(profileTagSchema).max(24).optional(),
    interests: z.array(profileTagSchema).max(24).optional(),
    githubUrl: optionalUrlSchema,
    linkedinUrl: optionalUrlSchema,
    portfolioUrl: optionalUrlSchema,
    publicProfileEnabled: z.boolean().optional(),
  })
  .refine(hasAtLeastOneDefinedValue, {
    message: 'At least one profile field is required',
  })

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>