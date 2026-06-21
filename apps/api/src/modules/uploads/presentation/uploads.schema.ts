import { z } from 'zod'

const optionalAltTextSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? trimmedValue : undefined
  },
  z.string().max(180, 'Alt text must not exceed 180 characters').optional()
)

const aiPromptSchema = z
  .string()
  .trim()
  .min(5, 'Prompt must be at least 5 characters')
  .max(500, 'Prompt must not exceed 500 characters')

export const profileImageUploadSchema = z.object({
  altText: optionalAltTextSchema,
})

export const generateAiAvatarPreviewSchema = z.object({
  prompt: aiPromptSchema,
})

export const generateAiBannerPreviewSchema = z.object({
  prompt: aiPromptSchema,
})

export type ProfileImageUploadInput = z.infer<
  typeof profileImageUploadSchema
>

export type GenerateAiAvatarPreviewInput = z.infer<
  typeof generateAiAvatarPreviewSchema
>

export type GenerateAiBannerPreviewInput = z.infer<
  typeof generateAiBannerPreviewSchema
>