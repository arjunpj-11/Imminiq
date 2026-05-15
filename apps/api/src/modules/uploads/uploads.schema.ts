import { z } from 'zod'

export const profileImageUploadSchema = z.object({
  altText: z.string().trim().max(180).optional(),
})

export const generateAiAvatarPreviewSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(5, 'Prompt must be at least 5 characters')
    .max(500, 'Prompt must not exceed 500 characters'),
})

export const generateAiBannerPreviewSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(5, 'Prompt must be at least 5 characters')
    .max(500, 'Prompt must not exceed 500 characters'),
})